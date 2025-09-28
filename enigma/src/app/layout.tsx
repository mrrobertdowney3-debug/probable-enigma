export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black min-h-screen w-full overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
