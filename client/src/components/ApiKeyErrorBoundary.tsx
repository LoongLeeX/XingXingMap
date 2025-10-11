/**
 * API Key 错误边界组件
 * 处理 API Key 相关的错误和回退机制
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ApiKeyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ [ApiKeyErrorBoundary] 捕获到错误:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-6 border-red-200 bg-red-50 max-w-2xl mx-auto mt-8">
          <div className="text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                API Key 配置错误
              </h3>
              <p className="text-red-700 mt-2">
                {this.state.error?.message || '发生了未知错误'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 text-left">
              <h4 className="font-medium text-gray-900 mb-2">可能的解决方案：</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 检查 Google Maps API Key 是否正确配置</li>
                <li>• 确认 API Key 具有必要的权限</li>
                <li>• 验证 API Key 的配额是否充足</li>
                <li>• 检查网络连接是否正常</li>
              </ul>
            </div>

            <div className="flex justify-center space-x-3">
              <Button onClick={this.handleRetry}>
                重试
              </Button>
              <Button variant="secondary" onClick={() => window.location.href = '/settings'}>
                前往设置
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="text-left bg-gray-100 p-4 rounded text-xs">
                <summary className="cursor-pointer font-medium">调试信息</summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.error?.stack}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

// 高阶组件包装器
export function withApiKeyErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ApiKeyErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ApiKeyErrorBoundary>
    );
  };
}
