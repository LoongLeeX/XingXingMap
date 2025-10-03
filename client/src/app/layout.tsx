/**
 * Root Layout
 */

import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Google Maps 标记应用',
  description: '一个功能完整的地图标记应用，支持地址搜索、标记管理、卫星视图切换以及 2D/3D 对比视图',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}

