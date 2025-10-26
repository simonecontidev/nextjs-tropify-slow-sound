import "./globals.css";
import type { Metadata } from "next";
import { AudioProvider } from "@/contexts/AudioProvider";

export const metadata: Metadata = {
  title: "Tropify — The Slow Sound Garden",
  description: "A serene, GSAP-animated tropical sound experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-50 antialiased">
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}