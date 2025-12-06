import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZANT - ZUS Accident Notification Tool",
  description: "System wspierania zgłoszeń i decyzji ZUS w sprawie uznania zdarzeń za wypadki przy pracy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">{children}</body>
    </html>
  );
}

