import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crystal One",
  description: "Crystal One - Your trusted shopping and earning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
