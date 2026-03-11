import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grizzle Time Tracking",
  description: "Internal time tracking dashboard for Grizzle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
