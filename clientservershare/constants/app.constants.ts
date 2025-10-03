/**
 * 应用常量
 */

// 文件上传相关
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES_PER_MARKER: 10,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_FILE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

// 标记相关
export const MARKER_CONSTANTS = {
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  DEFAULT_MARKER_COLOR: '#EA4335', // Google 红色
} as const;

// API 相关
export const API_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器错误，请稍后重试',
  VALIDATION_ERROR: '数据验证失败',
  NOT_FOUND: '未找到请求的资源',
  UNAUTHORIZED: '未授权访问',
  FILE_TOO_LARGE: '文件大小超过限制',
  INVALID_FILE_TYPE: '不支持的文件类型',
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  MARKER_CREATED: '标记创建成功',
  MARKER_UPDATED: '标记更新成功',
  MARKER_DELETED: '标记删除成功',
  FILE_UPLOADED: '文件上传成功',
} as const;

