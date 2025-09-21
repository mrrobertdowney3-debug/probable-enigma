import React from "react";

export default function Contact() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-blue-900 text-white p-8">
      <h2 className="text-3xl font-bold mb-4 tracking-tight">Contact</h2>
      <p className="max-w-xl text-lg text-gray-300 mb-4 text-center">
        Have questions, feedback, or want to collaborate? Reach out!
      </p>
      <form className="w-full max-w-md bg-black bg-opacity-40 rounded-lg p-6 flex flex-col gap-4 shadow-lg">
        <input className="rounded px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your Name" required />
        <input className="rounded px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your Email" type="email" required />
        <textarea className="rounded px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your Message" rows={4} required />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition">Send</button>
      </form>
    </section>
  );
}
