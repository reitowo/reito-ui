import type { ReactNode } from 'react';
import { refractor } from 'refractor/core';
import bash from 'refractor/bash';
import css from 'refractor/css';
import go from 'refractor/go';
import javascript from 'refractor/javascript';
import json from 'refractor/json';
import jsx from 'refractor/jsx';
import markdown from 'refractor/markdown';
import markup from 'refractor/markup';
import powershell from 'refractor/powershell';
import python from 'refractor/python';
import rust from 'refractor/rust';
import sql from 'refractor/sql';
import tsx from 'refractor/tsx';
import typescript from 'refractor/typescript';
import yaml from 'refractor/yaml';

// Register a bounded set once; no all-languages bundle, runtime downloads or DOM rewriting.
for (const grammar of [markup, css, javascript, typescript, jsx, tsx, json, bash, powershell, python, sql, yaml, markdown, go, rust]) refractor.register(grammar);
refractor.alias({ bash: ['shell'], powershell: ['ps1'] });
// listLanguages excludes Prism helpers such as "extend"; registered() does not.
const supportedLanguages = new Set(refractor.listLanguages().filter(name => !['text', 'plain', 'plaintext', 'txt', 'none'].includes(name)));

type SyntaxNode = ReturnType<typeof refractor.highlight>['children'][number];

function renderTokens(nodes: readonly SyntaxNode[], prefix = ''): ReactNode[] {
  return nodes.map((node, index) => {
    if (node.type === 'text') return node.value;
    if (node.type !== 'element') return null;
    const key = `${prefix}${index}`;
    const names = node.properties.className;
    // Only text and spans reach React. Source markup is never interpreted as HTML.
    return <span key={key} className={Array.isArray(names) ? names.join(' ') : undefined}>{renderTokens(node.children, `${key}.`)}</span>;
  });
}

/** Unsupported languages and large inputs remain exact, selectable source. */
export function highlightCode(code: string, language: string) {
  const normalized = language.trim().toLowerCase();
  const plain = { content: code as ReactNode, highlighted: false, language: normalized };
  if (!code || code.length > 50_000 || !supportedLanguages.has(normalized)) return plain;
  try {
    return { content: renderTokens(refractor.highlight(code, normalized).children), highlighted: true, language: normalized };
  } catch {
    return plain;
  }
}
