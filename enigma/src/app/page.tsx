
import CosmosVisualization from "./components/CosmosVisualization";

export default function Home() {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center bg-black p-0 m-0">
      {/* Hero Section: CosmosVisualization */}
      <section className="w-full h-screen flex items-center justify-center relative overflow-hidden">
        <CosmosVisualization />
      </section>
    </main>
  );
}
