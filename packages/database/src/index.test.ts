import { describe, expect, it, vi } from 'vitest';
import { Database, type DatabaseConfig } from './index';

describe('Database', () => {
  it('should create a database instance', () => {
    const config: DatabaseConfig = {
      connectionString: 'test://localhost:5432/test',
    };
    const db = new Database(config);
    expect(db).toBeInstanceOf(Database);
  });

  it('should log connection message', async () => {
    const config: DatabaseConfig = {
      connectionString: 'test://localhost:5432/test',
    };
    const db = new Database(config);
    const consoleSpy = vi.spyOn(console, 'log');

    await db.connect();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Connecting to database with connection string: test://localhost:5432/test'
    );
    consoleSpy.mockRestore();
  });

  it('should log disconnect message', async () => {
    const config: DatabaseConfig = {
      connectionString: 'test://localhost:5432/test',
    };
    const db = new Database(config);
    const consoleSpy = vi.spyOn(console, 'log');

    await db.disconnect();

    expect(consoleSpy).toHaveBeenCalledWith('Disconnecting from database...');
    consoleSpy.mockRestore();
  });
});
