# R2 Setup — Deferred

> **Status: Skipped.** Not needed for the current catalog. Come back here when you need to host custom GLB files or enable the model baking export feature.

---

## Why it was skipped

The seed catalog already uses Khronos GitHub CDN URLs for all 6 GLB files:
- `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/...`

These load fine in the browser with no CORS issues and cost nothing. R2 is only needed when you outgrow this or want to host your own models.

---

## When to come back here

- You want to add **custom catalog GLB files** not on the Khronos CDN
- You want to enable **GLB baking** (the `/api/upload` presigned URL endpoint — code is already written, just needs env vars)
- The Khronos CDN goes down or you want more control over availability/cache

---

## What's already done (no code changes needed)

The upload route is **fully implemented** at [`app/api/upload/route.ts`](./app/api/upload/route.ts):
- Uses `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (already installed)
- Returns a presigned PUT URL for `models/<id>.glb`
- Sets `Cache-Control: public, max-age=31536000, immutable`
- Requires auth (401 if not signed in)
- Returns 501 gracefully until R2 env vars are set — **no breakage**

---

## Steps to activate when ready

### 1. Cloudflare Dashboard

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Storage & Databases → R2 Object Storage → Overview**
2. **Create bucket** (e.g. `scalebench-assets`)
3. Bucket **Settings → Public access** → enable public R2.dev URL (or attach a custom domain)
4. Bucket **Settings → CORS policy**:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```

5. **R2 → Manage API Tokens → Create API token**
   - Permission: Object Read & Write
   - Scope: your bucket only
   - Copy **Access Key ID** and **Secret Access Key**

### 2. Add env vars to `.env.local` (and Vercel/host)

```bash
R2_ACCOUNT_ID=<cloudflare-account-id>       # visible in the R2 overview URL
R2_ACCESS_KEY_ID=<from-step-5>
R2_SECRET_ACCESS_KEY=<from-step-5>
R2_BUCKET=scalebench-assets
```

### 3. Upload GLB files

Via Cloudflare dashboard drag-and-drop, or CLI:

```bash
npx wrangler r2 object put scalebench-assets/models/myfile.glb --file ./myfile.glb
```

Use **content-hashed filenames** (e.g. `helmet-abc123.glb`) so cache busting is explicit.

### 4. Update `glb_url` in the database

```sql
UPDATE models
SET glb_url   = 'https://pub-xxxx.r2.dev/models/myfile.glb',
    thumb_url = 'https://pub-xxxx.r2.dev/thumbs/myfile.webp'
WHERE slug = 'your-model-slug';
```

---

## Free tier limits (as of June 2025)

| Resource | Free |
|----------|------|
| Storage | 10 GB / month |
| Class A ops (writes) | 1M / month |
| Class B ops (reads) | 10M / month |
| Egress | **$0 always** |

You will not hit these limits with a small catalog. Only charged past the limit — no monthly fee.
