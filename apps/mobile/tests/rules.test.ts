import { createRequire } from 'node:module';
import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const rules = require('../tooling/eslint-rules.cjs');
const lint = (code: string, filename: string) => new Linter().verify(code, {
  plugins: { project: rules },
  rules: { 'project/design-tokens': 'error', 'project/boundaries': 'error' },
}, { filename });

describe('shared project rules', () => {
  it('rejects a fixed color and spacing in a feature', () => {
    expect(lint('const style = { color: "#ffffff", padding: 18 };', 'src/features/food/Screen.js')).toHaveLength(2);
  });
  it('accepts semantic tokens and layout zero', () => {
    expect(lint('const style = { color: theme.colors.text.primary, padding: theme.spacing.md, margin: 0 };', 'src/features/food/Screen.js')).toHaveLength(0);
  });
  it('rejects a domain dependency on React', () => {
    expect(lint('import React from "react";', 'src/domain/records/rules.js')[0].messageId).toBe('domain');
  });
  it('rejects a feature bypassing the data service', () => {
    expect(lint('import { db } from "@/data/sqlite/database";', 'src/features/food/Screen.js')[0].messageId).toBe('data');
  });
  it('allows public feature interfaces and rejects deep imports', () => {
    expect(lint('import { RecordCard } from "@/features/diary";', 'src/features/home/Screen.js')).toHaveLength(0);
    expect(lint('import { RecordCard } from "@/features/diary/RecordCard";', 'src/features/home/Screen.js')[0].messageId).toBe('feature');
  });
});
