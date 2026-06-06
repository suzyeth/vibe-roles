import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roll Call — AI Group Drama",
  description: "Turn a quiet chat into a mini AI adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}