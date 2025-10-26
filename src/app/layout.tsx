import "./globals.css";
import type { Metadata } from "next";
import { AudioProvider } from "@/contexts/AudioProvider";

export const metadata: Metadata = {
  title: "Tropify — The Slow Sound Garden",
  description: "A serene, tropical slow-sound experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="text-neutral-50 antialiased"          // 👈 rimosso bg-neutral-950
        style={{ backgroundColor: "var(--page-bg)" }}     // 👈 usa la variabile
        suppressHydrationWarning
      >
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}