import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { debtDirectionEnum } from '../../database/schema';
import type { Debt } from '../../database/schema';

const directions = debtDirectionEnum.enumValues;

export class CreateDebtDto {
  @IsUUID()
  contactId: string;

  @IsIn(directions)
  direction: Debt['direction'];

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
