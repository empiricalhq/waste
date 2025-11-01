// How to use this
//
// import { renderPasswordReset } from '@lima-garbage/email';
// const html = renderPasswordReset({
//   userName: 'John Doe',
// resetUrl: 'https://example.com/reset?token=abc123',
// });

// biome-ignore lint/performance/noBarrelFile: entry point
export { renderPasswordReset } from './reset-password-template.js';
