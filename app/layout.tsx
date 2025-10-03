import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

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
        {/* 加载 Google Maps API - 2D 地图使用 weekly 版本 */}
        {/* 注意：3D 地图需要单独的 alpha 版本和 maps3d 库 */}
        <script
          async
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=alpha&libraries=maps3d,places`}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
