/**
 * 改进的验证方法说明组件
 * 解释新的 API Key 验证逻辑
 */

'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';

export function ImprovedValidationInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="secondary"
        size="sm"
        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
      >
        ✅ 改进的验证方法
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="✅ 改进的 API Key 验证方法"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <Card className="p-4 bg-green-50 border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">🎯 验证方法已优化</h3>
            <p className="text-sm text-green-700">
              我们已经改进了 API Key 验证逻辑，使用多种方法来确保准确性，
              避免因为单一 API（如 Geocoding API）的问题导致验证失败。
            </p>
          </Card>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">🔄 新的验证流程</h4>
            
            <Card className="p-3 border-blue-200 bg-blue-50">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">1️⃣</span>
                <h5 className="font-medium text-blue-800">Maps JavaScript API 直接测试</h5>
              </div>
              <p className="text-sm text-blue-700 ml-6">
                直接加载 Maps JavaScript API 脚本来验证 API Key，这是最准确的方法，
                因为它测试的就是应用实际使用的 API。
              </p>
            </Card>

            <Card className="p-3 border-purple-200 bg-purple-50">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">2️⃣</span>
                <h5 className="font-medium text-purple-800">Static Maps API 验证</h5>
              </div>
              <p className="text-sm text-purple-700 ml-6">
                使用 Static Maps API 进行轻量级验证，这个 API 通常默认启用，
                不需要额外配置，是很好的备用验证方法。
              </p>
            </Card>

            <Card className="p-3 border-orange-200 bg-orange-50">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">3️⃣</span>
                <h5 className="font-medium text-orange-800">Places API 测试</h5>
              </div>
              <p className="text-sm text-orange-700 ml-6">
                如果启用了 Places API，会进行测试。即使失败也不会影响整体验证结果，
                因为这个 API 是可选的。
              </p>
            </Card>

            <Card className="p-3 border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">4️⃣</span>
                <h5 className="font-medium text-gray-800">Geocoding API 备用验证</h5>
              </div>
              <p className="text-sm text-gray-700 ml-6">
                作为最后的备用方法使用 Geocoding API。如果前面的方法都无法确定结果，
                才会使用这个方法。
              </p>
            </Card>
          </div>

          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">🔧 解决了什么问题？</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <div><strong>问题:</strong> 之前只使用 Geocoding API 验证，如果这个 API 有问题就会验证失败</div>
              <div><strong>解决:</strong> 现在使用多种 API 进行验证，更加可靠和准确</div>
              <div><strong>优势:</strong> 即使某个 API 未启用或有问题，其他 API 仍可以验证 API Key 的有效性</div>
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">💡 验证逻辑说明</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• <strong>任何一个方法成功</strong> → API Key 有效 ✅</div>
              <div>• <strong>所有方法都失败但无明确拒绝</strong> → 可能是网络问题，假设有效 ⚠️</div>
              <div>• <strong>收到明确的 REQUEST_DENIED</strong> → API Key 无效 ❌</div>
              <div>• <strong>网络错误</strong> → 不影响 API Key 状态判断 🌐</div>
            </div>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">🎉 现在的优势</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>✅ 更准确的验证结果</div>
              <div>✅ 减少误报（假阳性）</div>
              <div>✅ 更好的错误诊断</div>
              <div>✅ 适应不同的 API 配置</div>
              <div>✅ 网络问题容错处理</div>
            </div>
          </Card>

          <div className="flex justify-center">
            <Button onClick={() => setIsOpen(false)}>
              ✅ 了解了
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
