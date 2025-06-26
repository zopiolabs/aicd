import CMS from '@aicd/cms';
// Web App Entry Point
import { log } from '@aicd/core';

log('Starting AICD Web App...');

// Placeholder web app initialization
export async function initWebApp() {
  const cms = new CMS();
  const content = await cms.getContent('home');

  if (content) {
    log(`Loaded content: ${content.title}`);
  } else {
    log('No content found');
  }
}

initWebApp();
