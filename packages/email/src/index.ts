// How to use this
//
// import { renderPasswordReset } from '@lima-garbage/email';
// const html = await renderPasswordReset({
//   userName: 'John Doe',
//   resetUrl: 'https://example.com/reset?token=abc123',
// });

// biome-ignore lint/performance/noBarrelFile: entry point
export { renderPasswordReset } from './render.js';
