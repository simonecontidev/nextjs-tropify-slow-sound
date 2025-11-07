// src/app/scene/[id]/page.tsx
export default async function ScenePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; 

  return (
    <main style={{ padding: 24 }}>
      <h1>Scene #{id}</h1>
    </main>
  );
}