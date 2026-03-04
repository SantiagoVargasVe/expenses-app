import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';
import { transactionKindEnum } from '../../database/schema';
import type { TransactionKind } from '../../database/schema';

const kinds = transactionKindEnum.enumValues;

export class UpdateTransactionDto {
  @IsOptional()
  @IsIn(kinds)
  kind?: TransactionKind;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount?: number;

  @ValidateIf((value: UpdateTransactionDto) => value.kind !== 'transfer')
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ValidateIf((value: UpdateTransactionDto) => value.kind === 'transfer')
  @IsOptional()
  @IsUUID()
  fromAccountId?: string;

  @ValidateIf((value: UpdateTransactionDto) => value.kind === 'transfer')
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
  occurredAt?: Date;
}
