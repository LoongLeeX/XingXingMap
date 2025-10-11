/**
 * Toast 提示组件
 * 支持复制错误信息
 */

'use client';

import React, { useState, useEffect } from 'react';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  canCopy?: boolean;
}

interface ToastStore {
  toasts: ToastData[];
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  hideToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // 自动关闭
    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration || 5000);
    }
  },
  hideToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearAll: () => set({ toasts: [] }),
}));

// Toast 容器组件
export function ToastContainer() {
  const { toasts, hideToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
      ))}
    </div>
  );
}

// 单个 Toast 项
function ToastItem({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `${toast.title}${toast.message ? '\n\n' + toast.message : ''}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: '✅',
          iconBg: 'bg-green-100 text-green-600',
          title: 'text-green-900',
          message: 'text-green-700',
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: '❌',
          iconBg: 'bg-red-100 text-red-600',
          title: 'text-red-900',
          message: 'text-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: '⚠️',
          iconBg: 'bg-yellow-100 text-yellow-600',
          title: 'text-yellow-900',
          message: 'text-yellow-700',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'ℹ️',
          iconBg: 'bg-blue-100 text-blue-600',
          title: 'text-blue-900',
          message: 'text-blue-700',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`${styles.bg} border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md animate-slide-in-right`}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div className={`${styles.iconBg} rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0`}>
          <span className="text-lg">{styles.icon}</span>
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${styles.title} mb-1`}>
            {toast.title}
          </h3>
          {toast.message && (
            <p className={`text-sm ${styles.message} break-words whitespace-pre-wrap`}>
              {toast.message}
            </p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {toast.canCopy && (
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-white/50 rounded transition-colors"
              title={copied ? '已复制' : '复制错误信息'}
            >
              <span className="text-base">
                {copied ? '✓' : '📋'}
              </span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/50 rounded transition-colors"
            title="关闭"
          >
            <span className="text-gray-500">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 便捷函数
export const toast = {
  success: (title: string, message?: string) => {
    useToastStore.getState().showToast({
      type: 'success',
      title,
      message,
      duration: 3000,
    });
  },
  error: (title: string, message?: string, canCopy = true) => {
    useToastStore.getState().showToast({
      type: 'error',
      title,
      message,
      duration: 0, // 错误不自动关闭
      canCopy,
    });
  },
  warning: (title: string, message?: string) => {
    useToastStore.getState().showToast({
      type: 'warning',
      title,
      message,
      duration: 4000,
    });
  },
  info: (title: string, message?: string) => {
    useToastStore.getState().showToast({
      type: 'info',
      title,
      message,
      duration: 3000,
    });
  },
};
