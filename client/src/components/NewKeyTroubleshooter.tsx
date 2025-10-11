/**
 * New API Key Troubleshooter
 * Guides users through solving issues with newly created keys that appear invalid.
 */
'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { Loading } from './ui/Loading';
import { useApiKeyActions, useCurrentApiKey, useApiKeyConfigs, useApiKeyStore } from '../lib/stores/api-key-store';
import { DetailedValidationResults } from './DetailedValidationResults';
import type { ApiKeyValidationResult } from '../lib/api-key-manager';

export function NewKeyTroubleshooter() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<ApiKeyValidationResult | null>(null);
  
  const actions = useApiKeyActions();
  const currentApiKey = useCurrentApiKey();
  const { current: currentConfig } = useApiKeyConfigs();

  const handleRunValidation = async () => {
    if (!currentApiKey) return;
    setIsLoading(true);
    setValidationResult(null);
    try {
      await actions.validateCurrentKey();
      // The result is now in the store, so we can read it from there.
      // We'll add a short delay to ensure the store has updated.
      setTimeout(() => {
        // This assumes the validation result is fresh in the config object
        const freshResult = useApiKeyStore.getState().currentConfig?.validationResult;
        if (freshResult) {
          setValidationResult(freshResult);
        }
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Validation failed", error);
      setIsLoading(false);
    }
  };
  
  // Only show the troubleshooter if there's an invalid key
  if (currentConfig?.validationStatus !== 'invalid' && currentConfig?.validationStatus !== 'error') {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="danger"
        size="sm"
        className="animate-pulse"
      >
        <span className="text-lg mr-2">❗</span>
        新 Key 无效？点击此处进行排查
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="新 API Key 问题排查向导">
        <div className="space-y-6 text-gray-700">
          <Card className="p-4 bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-800">检测到 API Key 无效或已过期</h3>
            <p className="text-sm mt-1 text-red-700">
              如果您确定这是一个**新创建**的密钥，那么问题几乎总是出在 Google Cloud 项目的配置上，而不是密钥本身。让我们来逐步排查。
            </p>
          </Card>
          
          {/* Step 1: Billing */}
          <div>
            <h4 className="font-semibold text-lg mb-2">第 1 步 (最关键): 检查结算帐号</h4>
            <p className="mb-3 text-sm">
              所有 Google Maps Platform 项目，**即使只使用免费额度**，都必须关联一个有效的**结算帐号** (Billing Account)。这是最常见的“新 Key 无效”问题的原因。
            </p>
            <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">
                前往 Google Cloud Billing ↗
              </Button>
            </a>
            <ul className="list-disc list-inside text-sm mt-3 space-y-1 text-gray-600">
              <li>确保您的项目已链接到一个“Active”状态的结算帐号。</li>
              <li>如果您没有结算帐号，需要创建一个并启用。</li>
            </ul>
          </div>
          
          {/* Step 2: APIs */}
          <div>
            <h4 className="font-semibold text-lg mb-2">第 2 步: 检查已启用的 API</h4>
            <p className="mb-3 text-sm">
              确保您的项目已启用所有必需的 API。
            </p>
            <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">
                前往 API 库 ↗
              </Button>
            </a>
            <ul className="list-disc list-inside text-sm mt-3 space-y-1 text-gray-600">
              <li>必需: `Maps JavaScript API`</li>
              <li>必需: `Geocoding API`</li>
              <li>推荐: `Places API`</li>
            </ul>
          </div>

          {/* Step 3: Run Validation */}
          <div>
            <h4 className="font-semibold text-lg mb-2">第 3 步: 运行详细验证</h4>
            <p className="mb-3 text-sm">
              在您确认以上两步配置无误后，点击下方按钮，系统将对多个 Google API 服务进行测试，并返回详细结果。
            </p>
            <Button onClick={handleRunValidation} disabled={isLoading}>
              {isLoading && <Loading size="sm" />}
              {isLoading ? '正在运行详细验证...' : '运行详细验证'}
            </Button>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="mt-4">
              <h4 className="font-semibold text-lg mb-2">详细验证结果:</h4>
              <DetailedValidationResults result={validationResult} />
              <div className="text-xs text-gray-500 mt-2">
                <p>如果 `Geocoding API` 或 `Maps JavaScript API` 显示 `REQUEST_DENIED`，通常仍然是结算帐号问题。</p>
              </div>
            </div>
          )}

        </div>
      </Modal>
    </>
  );
}
