import { Global, Module } from '@nestjs/common';

import { InMemoryDrizzleService } from './in-memory-drizzle.service';

@Global()
@Module({
  providers: [InMemoryDrizzleService],
  exports: [InMemoryDrizzleService],
})
export class DatabaseModule {}
