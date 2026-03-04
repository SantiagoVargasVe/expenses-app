import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  recurringFrequencyEnum,
  recurringStatusEnum,
  recurringTypeEnum,
  transactionKindEnum,
} from '../../database/schema';
import type { RecurringRule, TransactionKind } from '../../database/schema';

const types = recurringTypeEnum.enumValues;
const frequencies = recurringFrequencyEnum.enumValues;
const statuses = recurringStatusEnum.enumValues;
const kinds = transactionKindEnum.enumValues;

export class UpdateRecurringDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(types)
  type?: RecurringRule['type'];

  @IsOptional()
  @IsIn(frequencies)
  frequency?: RecurringRule['frequency'];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  dayOfMonth?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  @Type(() => Number)
  dayOfWeek?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  interval?: number;

  @IsOptional()
  @IsIn(kinds)
  kind?: TransactionKind;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount?: number;

  @ValidateIf((value: UpdateRecurringDto) => value.kind !== 'transfer')
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ValidateIf((value: UpdateRecurringDto) => value.kind === 'transfer')
  @IsOptional()
  @IsUUID()
  fromAccountId?: string;

  @ValidateIf((value: UpdateRecurringDto) => value.kind === 'transfer')
  @IsOptional()
  @IsUUID()
  toAccountId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsIn(statuses)
  status?: RecurringRule['status'];
}
