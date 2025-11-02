import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = join(import.meta.dir, '../out');
const SRC_DIR = join(import.meta.dir, '../src');

interface Token {
  name: string;
  required: boolean;
}

interface Template {
  id: string;
  functionName: string;
  tokens: Token[];
}

const TEMPLATES: Template[] = [
  {
    id: 'reset-password',
    functionName: 'renderPasswordReset',
    tokens: [
      { name: 'userName', required: false },
      { name: 'resetUrl', required: true },
    ],
  },
];

function generateInterface(functionName: string, tokens: Token[]): string {
  const interfaceName = `${functionName.charAt(0).toUpperCase() + functionName.slice(1)}Params`;
  const fields = tokens.map((t) => `  ${t.name}${t.required ? '' : '?'}: string;`).join('\n');
  return `interface ${interfaceName} {\n${fields}\n}`;
}

function generateFunction(functionName: string, tokens: Token[]): string {
  const interfaceName = `${functionName.charAt(0).toUpperCase() + functionName.slice(1)}Params`;
  const requiredTokens = tokens.filter((t) => t.required);

  const validation =
    requiredTokens.length > 0
      ? `  ${requiredTokens.map((t) => `if (!params.${t.name}) throw new Error('Missing required: ${t.name}');`).join('\n  ')}\n`
      : '';

  const replacements = tokens
    .map((t) => {
      if (t.required) {
        return `  html = html.replace(/{{${t.name}}}/g, escapeHtml(params.${t.name}));`;
      }
      return `  if (params.${t.name}) html = html.replace(/{{${t.name}}}/g, escapeHtml(params.${t.name}));
  else html = html.replace(/<p[^>]*>.*?{{${t.name}}}.*?<\\/p>/gi, '');`;
    })
    .join('\n');

  return `export function ${functionName}(params: ${interfaceName}): string {
${validation}  let html = TEMPLATE;
${replacements}
  return html;
}`;
}

function build(): void {
  for (const template of TEMPLATES) {
    const htmlPath = join(DIST_DIR, `${template.id}.html`);

    if (!existsSync(htmlPath)) {
      process.exit(1);
    }

    const html = readFileSync(htmlPath, 'utf-8');
    const output = `/**
 * Auto-generated from ${template.id}.tsx
 * DO NOT EDIT - run 'bun run build'
 */

const TEMPLATE = ${JSON.stringify(html)};

${generateInterface(template.functionName, template.tokens)}

${generateFunction(template.functionName, template.tokens)}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
`;

    writeFileSync(join(SRC_DIR, `${template.id}-template.ts`), output, 'utf-8');
  }
}

build();
