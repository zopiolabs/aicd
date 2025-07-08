// API Server Entry Point
import { logger } from '@aicd/core';
import { Database } from '@aicd/database';

const apiLogger = logger.createChild('[API]');

// Placeholder API server
export async function startServer() {
  try {
    apiLogger.info('Starting AICD API Server...');

    const db = new Database({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost/aicd',
      poolSize: Number(process.env.DB_POOL_SIZE) || 10,
    });

    await db.connect();

    // Placeholder server logic
    const port = process.env.PORT || 3000;

    // TODO: Implement actual HTTP server
    apiLogger.info(`API Server listening on port ${port}`);

    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      apiLogger.info('SIGTERM received, shutting down gracefully...');
      await db.disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      apiLogger.info('SIGINT received, shutting down gracefully...');
      await db.disconnect();
      process.exit(0);
    });
  } catch (error) {
    apiLogger.fatal('Failed to start server', error);
    process.exit(1);
  }
}

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}
