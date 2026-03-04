import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;
  private _db!: NodePgDatabase<typeof schema>;
  constructor() {}

  onModuleInit() {
    const databaseUrl = process.env.DATABASE_URL;

    this.pool = databaseUrl
      ? new Pool({ connectionString: databaseUrl })
      : new Pool({
          host: process.env.DB_HOST ?? 'localhost',
          port: Number(process.env.DB_PORT ?? 5432),
          user: process.env.DB_USER ?? 'postgres',
          password: process.env.DB_PASSWORD ?? 'postgres',
          database: process.env.DB_NAME ?? 'appdb',
        });

    this._db = drizzle(this.pool, { schema });
  }

  get db() {
    return this._db;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
