/**
 * 客户端工具函数
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * 合并 CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * 格式化错误消息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '未知错误';
}

