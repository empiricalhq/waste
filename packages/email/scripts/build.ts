import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = join(import.meta.dir, '../dist');
const SRC_DIR = join(import.meta.dir, '../src');

interface TemplateToken {
  name: string;
  optional: boolean;
  removeLineIfEmpty?: boolean;
}

interface TemplateConfig {
  filename: string;
  outputName: string;
  functionName: string;
  tokens: TemplateToken[];
}

const TEMPLATES: TemplateConfig[] = [
  {
    filename: 'reset-password.html',
    outputName: 'reset-password-template.ts',
    functionName: 'renderPasswordReset',
    tokens: [
      { name: 'userName', optional: true, removeLineIfEmpty: true },
      { name: 'resetUrl', optional: false },
    ],
  },
];

function generateInterface(functionName: string, tokens: TemplateToken[]): string {
  const interfaceName = `${functionName.charAt(0).toUpperCase() + functionName.slice(1)}Params`;
  const fields = tokens.map((token) => `  ${token.name}${token.optional ? '?' : ''}: string;`).join('\n');

  return `export interface ${interfaceName} {\n${fields}\n}`;
}

function generateRenderFunction(functionName: string, tokens: TemplateToken[]): string {
  const paramsType = `${functionName.charAt(0).toUpperCase() + functionName.slice(1)}Params`;

  const tokenReplacements = tokens
    .map((token) => {
      if (token.optional && token.removeLineIfEmpty) {
        return `  // Handle optional ${token.name} - remove the greeting line if not provided
  if (params.${token.name}) {
    const escapedValue = escapeHtml(params.${token.name});
    html = html.replace(/{{${token.name}}}/g, escapedValue);
  } else {
    // Remove the ${token.name} greeting line entirely
    html = html.replace(/<p[^>]*>Hola {{${token.name}}},<\\/p>/gi, '');
  }`;
      }
      return `  html = html.replace(/{{${token.name}}}/g, escapeHtml(params.${token.name}));`;
    })
    .join('\n');

  return `/**
 * Render the password reset email with provided parameters.
 * All values are HTML-escaped for security.
 */
export function ${functionName}(
  params: ${paramsType}
): string {
  let html = TEMPLATE;

${tokenReplacements}

  return html;
}`;
}

function processTemplate(config: TemplateConfig): void {
  const htmlPath = join(DIST_DIR, config.filename);

  if (!existsSync(htmlPath)) {
    process.exit(1);
  }

  const htmlContent = readFileSync(htmlPath, 'utf-8');

  const moduleContent = `/**
 * Auto-generated from ${config.filename}
 * DO NOT EDIT MANUALLY - run 'bun run build' to regenerate
 */

// The raw HTML template with {{placeholders}}
const TEMPLATE = ${JSON.stringify(htmlContent)};

${generateInterface(config.functionName, config.tokens)}

${generateRenderFunction(config.functionName, config.tokens)}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
`;

  const outputPath = join(SRC_DIR, config.outputName);
  writeFileSync(outputPath, moduleContent, 'utf-8');
}

for (const template of TEMPLATES) {
  processTemplate(template);
}
