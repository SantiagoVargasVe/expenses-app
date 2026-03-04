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
import { transactionKindEnum } from '../../database/schema';
import type { TransactionKind } from '../../database/schema';

const kinds = transactionKindEnum.enumValues;

export class CreateTransactionDto {
  @IsIn(kinds)
  kind: TransactionKind;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ValidateIf((value: CreateTransactionDto) => value.kind !== 'transfer')
  @IsUUID()
  accountId?: string;

  @ValidateIf((value: CreateTransactionDto) => value.kind === 'transfer')
  @IsUUID()
  fromAccountId?: string;

  @ValidateIf((value: CreateTransactionDto) => value.kind === 'transfer')
  @IsUUID()
  toAccountId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  @Type(() => Number)
  installmentsTotal?: number;

  @IsOptional()
  @Type(() => Date)
  occurredAt?: Date;
}
