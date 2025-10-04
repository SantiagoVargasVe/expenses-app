import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { userRoleEnum } from '../../database/schema';
import type { UserRole } from '../../database/schema';

const availableRoles = userRoleEnum.enumValues;

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  @IsIn(availableRoles)
  role?: UserRole;
}
