import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "TaxLegit SOP",
  description: "SOP Generator Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-black">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
