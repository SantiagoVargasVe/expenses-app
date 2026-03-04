import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { accountTypeEnum } from '../../database/schema';
import type { AccountType } from '../../database/schema';

const accountTypes = accountTypeEnum.enumValues;

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn(accountTypes)
  type: AccountType;

  @ValidateIf((value: CreateAccountDto) => value.type === 'credit_card')
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  creditLimit?: number;

  @ValidateIf((value: CreateAccountDto) => value.type === 'credit_card')
  @IsInt()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  statementCutoffDay?: number;

  @ValidateIf((value: CreateAccountDto) => value.type === 'credit_card')
  @IsInt()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  statementDueDay?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
