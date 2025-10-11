/**
 * 导航组件
 * 提供应用内导航链接
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/Button';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / 标题 */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              🗺️ Google Maps 应用
            </Link>
          </div>

          {/* 导航链接 */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button
                variant={pathname === '/' ? 'primary' : 'secondary'}
                size="sm"
              >
                🏠 地图
              </Button>
            </Link>
            
            <Link href="/settings">
              <Button
                variant={pathname === '/settings' ? 'primary' : 'secondary'}
                size="sm"
              >
                ⚙️ 设置
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
