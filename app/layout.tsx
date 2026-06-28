import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScaleBench",
  description:
    "Place objects side by side in interactive 3D and compare their true real-world sizes on a shared, calibrated scale.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
