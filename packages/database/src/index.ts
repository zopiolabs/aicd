export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
}

export class Database {
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  connect(): void {
    console.log(`Connecting to ${this.config.host}:${this.config.port}/${this.config.database}`);
  }
}
