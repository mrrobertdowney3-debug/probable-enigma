import React from "react";

export default function Features() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white p-8">
      <h2 className="text-3xl font-bold mb-4 tracking-tight">Features</h2>
      <ul className="max-w-2xl text-lg text-gray-300 space-y-3">
        <li>🚀 Interactive 3D star field powered by Three.js</li>
        <li>📱 Mobile-first, responsive UI with Tailwind CSS</li>
        <li>🌓 Dark mode and tech-inspired gradients</li>
        <li>🧭 Keyboard and mouse navigation for exploration</li>
        <li>🔍 Real-time star data and hover details</li>
        <li>🛠️ Built with Next.js App Router and React</li>
      </ul>
    </section>
  );
}
