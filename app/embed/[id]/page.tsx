import type { Metadata } from "next";
import { SceneViewer } from "@/components/scene/SceneViewer";

// Read-only iframe viewer. No editing panels and no write APIs are exposed here.
export const metadata: Metadata = {
  // Allow embedding; the route itself is read-only.
  robots: { index: false },
};

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SceneViewer id={id} embed />;
}
