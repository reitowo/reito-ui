import { Blocks, Braces, Layers, Sparkles } from 'lucide-react';
import { basicCatalog } from '../../../packages/ui/src/basic/catalog';
import { complexCatalog } from '../../../packages/ui/src/complex/catalog';
import { aiCatalog } from '../../../packages/ui/src/ai/catalog';
import { affectCatalog } from '../../../packages/ui/src/affect/catalog';

export const layers = [
  { id: 'basic', name: '基础', icon: Blocks, description: '按钮、表单、导航与反馈。基于 shadcn / Base UI 的组合原语。', entries: basicCatalog },
  { id: 'complex', name: '复杂', icon: Braces, description: '将基础组件组合为表格、文件、搜索、设置与工作台。', entries: complexCatalog },
  { id: 'ai', name: 'AI', icon: Sparkles, description: '对话、输入、上下文、执行与产物。所有交互均为本地示例。', entries: aiCatalog },
  { id: 'affect', name: '模式', icon: Layers, description: 'Affect 风格的桌面模式：免费 MIT 移植与公开文档重建，全部走 Reito 主题与密度。', entries: affectCatalog },
] as const;
export type LayerId = typeof layers[number]['id'];
export const allComponents = layers.flatMap(layer => layer.entries.map(entry => ({ ...entry, layer: layer.id, layerName: layer.name })));
export type CatalogEntry = typeof allComponents[number];
export const componentName = (name: string) => name.replace(/\s*[\u3400-\u9fff].*$/u, '').trim() || name;
