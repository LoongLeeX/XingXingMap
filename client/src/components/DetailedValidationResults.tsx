/**
 * Detailed API Key Validation Results Component
 * Renders the step-by-step results from the ApiKeyValidationResult object.
 */
'use client';

import React from 'react';
import type { ApiKeyValidationResult, ValidationCheck } from '../lib/api-key-manager';
import { Card } from './ui/Card';

interface DetailedValidationResultsProps {
  result: ApiKeyValidationResult;
}

const getStatusIcon = (status: ValidationCheck['status']) => {
  switch (status) {
    case 'success':
      return <span className="text-green-500">✅</span>;
    case 'error':
      return <span className="text-red-500">❌</span>;
    case 'warning':
      return <span className="text-yellow-500">⚠️</span>;
    default:
      return <span>❓</span>;
  }
};

export function DetailedValidationResults({ result }: DetailedValidationResultsProps) {
  const overallColor = result.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  const overallTextColor = result.isValid ? 'text-green-800' : 'text-red-800';

  return (
    <Card className={`p-4 ${overallColor}`}>
      <h4 className={`font-semibold mb-3 ${overallTextColor}`}>
        {result.isValid ? '✅ 验证通过' : '❌ 验证失败'}
      </h4>
      <p className={`text-sm mb-4 ${overallTextColor}`}>
        {result.message}
      </p>

      <div className="space-y-3">
        {result.checks.map((check, index) => (
          <Card key={index} className="p-3 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(check.status)}
                <span className="font-medium text-gray-800">{check.name}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                check.status === 'success' ? 'bg-green-100 text-green-700' :
                check.status === 'error' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {check.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{check.message}</p>
            {check.details && (
              <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                <code className="break-all">{check.details}</code>
              </p>
            )}
          </Card>
        ))}
      </div>
    </Card>
  );
}
