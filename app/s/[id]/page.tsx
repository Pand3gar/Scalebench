import { SceneViewer } from "@/components/scene/SceneViewer";

export default async function SharedScenePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SceneViewer id={id} />;
}
