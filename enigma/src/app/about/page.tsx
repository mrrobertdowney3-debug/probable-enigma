import React from "react";

export default function About() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white p-8">
      <h2 className="text-3xl font-bold mb-4 tracking-tight">About This Project</h2>
      <p className="max-w-2xl text-lg text-gray-300 mb-4 text-center">
        This website is a tech-forward, interactive cosmos visualization and information hub. Built with Next.js, React, and Three.js, it demonstrates modern web technology, immersive 3D graphics, and a mobile-first design.
      </p>
      <p className="max-w-2xl text-base text-gray-400 text-center">
        Explore the cosmos, learn about the technology stack, and discover interactive features designed for both enthusiasts and professionals.
      </p>
    </section>
  );
}
