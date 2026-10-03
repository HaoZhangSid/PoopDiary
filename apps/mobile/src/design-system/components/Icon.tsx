import { createElement, isValidElement, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react-native';

export type IconProp = ReactNode | LucideIcon;

export function renderIcon(icon: IconProp, color: string, size: number): ReactNode {
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function' || (icon && typeof icon === 'object' && 'render' in icon)) {
    return createElement(icon as LucideIcon, { color, size });
  }
  return icon as ReactNode;
}
