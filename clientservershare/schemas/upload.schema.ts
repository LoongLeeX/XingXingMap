/**
 * Upload 验证 Schema
 */

import { z } from 'zod';

// 支持的图片类型
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// 最大文件大小 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 文件上传 Schema
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    })
    .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type), {
      message: 'Only JPEG, PNG, and WebP images are allowed',
    }),
});

// 批量上传 Schema
export const batchUploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .max(10, 'Maximum 10 files per upload')
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      { message: 'One or more files exceed the size limit' }
    )
    .refine(
      (files) => files.every((file) => ALLOWED_IMAGE_TYPES.includes(file.type)),
      { message: 'One or more files have invalid type' }
    ),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type BatchUploadInput = z.infer<typeof batchUploadSchema>;

