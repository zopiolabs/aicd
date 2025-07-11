import { authenticate } from '@aicd/auth';
// Mobile/Desktop App Entry Point
import { log } from '@aicd/core';

log('Starting AICD App...');

// Placeholder app initialization
export function initApp() {
  const token = 'placeholder-token';
  const user = authenticate(token);

  if (user) {
    log(`User authenticated: ${user.email}`);
  } else {
    log('Authentication failed');
  }
}

initApp();
