import assert from 'node:assert/strict';
import { test } from 'vitest';

import { darkTheme, lightTheme } from './theme';

function luminance(hex: string): number {
  assert.match(hex, /^#[0-9a-f]{6}$/i);
  const channels = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(foreground: string, background: string): number {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function expectContrast(name: string, foreground: string, background: string, minimum: number) {
  const ratio = contrast(foreground, background);
  assert.ok(ratio >= minimum, `${name}: ${foreground} on ${background} gives ${ratio.toFixed(3)}, requires ${minimum}`);
}

for (const theme of [lightTheme, darkTheme]) {
  test(`${theme.appearance}: regular text stays readable across shared surfaces`, () => {
    for (const [surfaceName, surface] of Object.entries(theme.colors.surface)) {
      expectContrast(`${surfaceName} primary`, theme.colors.text.primary, surface, 4.5);
      expectContrast(`${surfaceName} secondary`, theme.colors.text.secondary, surface, 4.5);
    }
    for (const group of ['feedback', 'entry', 'beverage', 'severity'] as const) {
      for (const [name, pair] of Object.entries(theme.colors[group])) {
        expectContrast(`${group}.${name}`, pair.fg, pair.bg, 4.5);
      }
    }
  });

  test(`${theme.appearance}: button default and pressed states keep text contrast`, () => {
    for (const [name, colors] of Object.entries(theme.colors.action)) {
      expectContrast(`${name} default`, colors.foreground, colors.background, 4.5);
      expectContrast(`${name} pressed`, colors.foreground, colors.pressed, 4.5);
    }
  });

  test(`${theme.appearance}: required control edges and selection marks are distinguishable`, () => {
    for (const [surfaceName, surface] of Object.entries(theme.colors.surface)) {
      expectContrast(`${surfaceName} control`, theme.colors.border.control, surface, 3);
      expectContrast(`${surfaceName} selected`, theme.colors.border.selected, surface, 3);
      expectContrast(`${surfaceName} focus`, theme.colors.focus, surface, 3);
    }
    for (const pair of Object.values(theme.colors.severity)) {
      expectContrast('severity selection mark', pair.fg, pair.bg, 3);
      expectContrast('severity unselected label', pair.fg, theme.colors.surface.card, 4.5);
    }
  });

  test(`${theme.appearance}: touch targets and text sizes retain usable minimums`, () => {
    assert.ok(theme.controls.minimumTouchTarget >= 48);
    assert.ok((theme.typography.body.fontSize ?? 0) >= 16);
    assert.ok((theme.typography.caption.fontSize ?? 0) >= 14);
  });
}
