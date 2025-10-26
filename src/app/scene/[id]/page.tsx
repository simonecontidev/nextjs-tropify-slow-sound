export default function SceneTest({ params }: { params: { id: string } }) {
  return (
    <main style={{padding:24,color:"#e5e7eb",background:"#0a0a0a",minHeight:"100vh"}}>
      <h1 style={{fontSize:24,marginBottom:8}}>Scene (test)</h1>
      <p>id: <code>{params.id}</code></p>
    </main>
  );
}