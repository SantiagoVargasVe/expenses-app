// src/database/drizzle.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;
  private _db!: NodePgDatabase<typeof schema>;

  //   constructor(private readonly config: ConfigService) {}

  constructor() {}

  onModuleInit() {
    this.pool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'appdb',
    });

    this._db = drizzle(this.pool, { schema });
    // Optional health check:
    // await this.pool.query('select 1');
  }

  get db() {
    return this._db;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
