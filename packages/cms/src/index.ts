// CMS package
import type { User } from '@aicd/core';

export interface Content {
  id: string;
  title: string;
  body: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export class CMS {
  async getContent(id: string): Promise<Content | null> {
    console.log('Getting content:', id);
    return null;
  }

  async createContent(content: Partial<Content>): Promise<Content> {
    console.log('Creating content:', content);
    return {} as Content;
  }
}

export default CMS;
