import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChatSidebar } from "@/components/chat/ChatSidebar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HermesStore — AI Ecommerce Manager",
  description: "Manage your entire ecommerce store with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <div className="flex">
          <ChatSidebar />
          <main className="flex-1 bg-obsidian min-h-screen">{children}</main>
        </div>
      </body>
    </html>
  );
}
