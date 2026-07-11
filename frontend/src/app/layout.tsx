import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChatSidebar } from "@/components/chat/ChatSidebar";

const inter = Inter({
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
      <body className={`${inter.className} antialiased`}>
        <ChatSidebar />
        <main className="ml-[400px] bg-obsidian min-h-screen">{children}</main>
      </body>
    </html>
  );
}
