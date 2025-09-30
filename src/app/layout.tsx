import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/providers/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Argo CRM",
  description: "Система управления взаимоотношениями с клиентами",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
      >
        <ThemeProvider>
          <Header />
          <ThemeToggle />
          <main className="flex-1 w-[80%] mx-auto px-4 py-5">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}