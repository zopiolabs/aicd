// Database package
export interface DatabaseConfig {
  connectionString: string;
  poolSize?: number;
}

export class Database {
  constructor(private config: DatabaseConfig) {}

  async connect(): Promise<void> {
    console.log(`Connecting to database with connection string: ${this.config.connectionString}`);
  }

  async disconnect(): Promise<void> {
    console.log('Disconnecting from database...');
  }
}
