import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class SettleDebtDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsUUID()
  accountId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
