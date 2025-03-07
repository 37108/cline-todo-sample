import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ToDo アプリ",
  description: "タスク管理のための ToDo アプリ",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <div className="relative min-h-screen">
          <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
            <div className="container flex h-16 items-center px-4">
              <h1 className="font-bold text-xl">ToDo アプリ</h1>
            </div>
          </header>
          <main className="container px-4 py-6 md:py-8">{children}</main>
          {modal}
        </div>
      </body>
    </html>
  );
}
