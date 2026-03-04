import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';
import { RecurringService } from './recurring.service';
import type {
  RecurringInstanceResponse,
  RecurringRuleResponse,
} from './recurring.types';

@UseGuards(JwtAuthGuard)
@Controller({ path: 'recurring', version: '1' })
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Get()
  list(
    @ActiveUser() user: AuthenticatedUser,
  ): Promise<RecurringRuleResponse[]> {
    return this.recurringService.listRules(user.id);
  }

  @Post()
  create(
    @ActiveUser() user: AuthenticatedUser,
    @Body() dto: CreateRecurringDto,
  ): Promise<RecurringRuleResponse> {
    return this.recurringService.createRule(user.id, dto);
  }

  @Patch(':id')
  update(
    @ActiveUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateRecurringDto,
  ): Promise<RecurringRuleResponse> {
    return this.recurringService.updateRule(user.id, id, dto);
  }

  @Post(':id/run')
  run(
    @ActiveUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<RecurringInstanceResponse> {
    return this.recurringService.runRule(user.id, id);
  }

  @Post(':id/mark-paid')
  markPaid(
    @ActiveUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<RecurringInstanceResponse> {
    return this.recurringService.markPaid(user.id, id);
  }
}
