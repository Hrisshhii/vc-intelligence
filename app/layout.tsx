import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "lucide-react";

export const metadata: Metadata = {
  title: "vc- intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex">
        <Sidebar />
        <main className="flex-1 p-8 bg-muted/30 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
