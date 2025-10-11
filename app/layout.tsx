import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastContainer } from '@/client/src/components/ui/Toast';
import { Navigation } from '@/client/src/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Google Maps 标记应用',
  description: '使用 Next.js 14 和 Google Maps API 构建的地图标记应用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Google Maps 脚本现在通过客户端组件动态加载 */}
      </head>
      <body className={inter.className}>
        <Navigation />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
