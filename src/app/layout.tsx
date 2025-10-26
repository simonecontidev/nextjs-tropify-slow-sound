import "./globals.css";
import type { Metadata } from "next";
import { AudioProvider } from "@/contexts/AudioProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Tropify — The Slow Sound Garden",
  description: "A serene, tropical slow-sound experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="text-neutral-50 antialiased"
        style={{ backgroundColor: "var(--page-bg)" }}
        suppressHydrationWarning
      >
        <AudioProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </AudioProvider>
      </body>
    </html>
  );
}