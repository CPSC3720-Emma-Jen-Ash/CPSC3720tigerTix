#!/usr/bin/env node
// scripts/postinstall.cjs
// Run per-service `npm ci` only during local development (skip in CI/deploy environments)
const { spawnSync } = require('child_process');

// Allow Render (which sets `CI`) to run per-service installs.
// Only treat Vercel as a CI environment where we skip per-service installs.
const isCI = !!process.env.VERCEL;
if (isCI) {
  console.log('CI environment detected — skipping root postinstall per-service installs.');
  process.exit(0);
}

const services = ['backend/user-authentication', 'backend/client-service', 'backend/admin-service', 'backend/llm-booking-service', 'frontend'];

for (const svc of services) {
  console.log(`Running npm ci --prefix ${svc}`);
  const res = spawnSync('npm', ['ci', '--prefix', svc, '--no-audit', '--no-fund'], { stdio: 'inherit', shell: true });
  if (res.status !== 0) {
    console.error(`npm ci failed for ${svc} (exit ${res.status}). Stopping postinstall.`);
    process.exit(res.status || 1);
  }
}

console.log('Per-service installs completed.');
