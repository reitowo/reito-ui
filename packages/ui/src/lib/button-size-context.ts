import { createContext } from 'react';
import type { VariantProps } from 'class-variance-authority';
import type { buttonVariants } from '../primitives/button.js';

// 表格等组合只为未指定尺寸的按钮提供默认值，不改变显式 props 或用户主题。
// 弹层开启新的操作区域，清除此组合默认值，保留原主题和密度。
export const ButtonSizeContext =
  createContext<VariantProps<typeof buttonVariants>['size']>(undefined);
