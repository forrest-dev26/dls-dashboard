import type { Metadata } from "next";
import { Inter, Lora, IBM_Plex_Mono } from "next/font/google";
import { SidebarNav } from "@/components/SidebarNav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Personal OS · Dashboard",
  description: "Christopher's personal operating system dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <SidebarNav />
        <div className="ml-[240px] min-h-screen max-[900px]:ml-0">
          {children}
        </div>
      </body>
    </html>
  );
}
