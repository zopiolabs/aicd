import { describe, expect, it, vi } from 'vitest';
import CMS, { type Content } from './index';

describe('CMS', () => {
  it('should create a CMS instance', () => {
    const cms = new CMS();
    expect(cms).toBeInstanceOf(CMS);
  });

  it('should return null when getting content', async () => {
    const cms = new CMS();
    const consoleSpy = vi.spyOn(console, 'log');
    
    const result = await cms.getContent('test-id');
    
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Getting content:', 'test-id');
    
    consoleSpy.mockRestore();
  });

  it('should create content', async () => {
    const cms = new CMS();
    const consoleSpy = vi.spyOn(console, 'log');
    
    const contentData = {
      title: 'Test Content',
      body: 'Test body'
    };
    
    await cms.createContent(contentData);
    
    expect(consoleSpy).toHaveBeenCalledWith('Creating content:', contentData);
    
    consoleSpy.mockRestore();
  });
});
