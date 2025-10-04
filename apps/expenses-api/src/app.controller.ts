import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DrizzleService } from './database/drizzle.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly drizzle: DrizzleService,
  ) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
