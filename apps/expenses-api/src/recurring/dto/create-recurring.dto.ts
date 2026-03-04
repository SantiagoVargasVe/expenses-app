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
  recurringTypeEnum,
  transactionKindEnum,
} from '../../database/schema';
import type { RecurringRule, TransactionKind } from '../../database/schema';

const types = recurringTypeEnum.enumValues;
const frequencies = recurringFrequencyEnum.enumValues;
const kinds = transactionKindEnum.enumValues;

export class CreateRecurringDto {
  @IsString()
  name: string;

  @IsIn(types)
  type: RecurringRule['type'];

  @IsIn(frequencies)
  frequency: RecurringRule['frequency'];

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

  @IsIn(kinds)
  kind: TransactionKind;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ValidateIf((value: CreateRecurringDto) => value.kind !== 'transfer')
  @IsUUID()
  accountId?: string;

  @ValidateIf((value: CreateRecurringDto) => value.kind === 'transfer')
  @IsUUID()
  fromAccountId?: string;

  @ValidateIf((value: CreateRecurringDto) => value.kind === 'transfer')
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
}
