import type { Metadata, Viewport } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import PerformanceMonitor from "@/components/PerformanceMonitor";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Creator Tools - 创作者工具箱",
  description: "免费的在线创作者工具集合，包括图片压缩、标题生成、YouTube缩略图下载等实用功能",
  keywords: "图片压缩,标题生成,YouTube缩略图,创作者工具,在线工具",
  authors: [{ name: "Creator Tools Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`font-sans antialiased bg-gray-50 min-h-screen`}
      >
        <ErrorBoundary>
          <ToastProvider>
            {children}
            <PerformanceMonitor />
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
