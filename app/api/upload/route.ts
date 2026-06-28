// Signed upload URL for baking a user model to a GLB on R2 (optional). Lathe/CSG
// models are fully re-evaluatable from their stored shape_def, so GLB baking is
// not required for save/re-edit — this endpoint exists for the asset-export path.
// Returns 501 until R2 credentials are provided. See implementation.md §7.12.
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;

const R2_CONFIGURED = Boolean(
  accountId && accessKeyId && secretAccessKey && bucket,
);

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
  });
}

export async function POST(req: Request) {
  if (!R2_CONFIGURED) {
    return NextResponse.json(
      {
        error:
          "R2 not configured. Set R2_* env vars to enable GLB baking.",
      },
      { status: 501 },
    );
  }

  // Require authentication — only signed-in users can upload.
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Sign in to upload models." },
        { status: 401 },
      );
    }
  }

  // Expect { modelId: string } in the body.
  const body = await req.json().catch(() => null);
  const modelId = body?.modelId;
  if (!modelId || typeof modelId !== "string") {
    return NextResponse.json(
      { error: "Missing modelId in request body." },
      { status: 400 },
    );
  }

  const key = `models/${modelId}.glb`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucket!,
      Key: key,
      ContentType: "model/gltf-binary",
      CacheControl: "public, max-age=31536000, immutable",
    });

    const uploadUrl = await getSignedUrl(getR2Client(), command, {
      expiresIn: 600, // 10 minutes
    });

    return NextResponse.json({ uploadUrl, key });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
