import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateContactDto } from './dto/create-contact.dto';
import { PeopleService } from './people.service';
import type { ContactResponse } from './people.types';

@UseGuards(JwtAuthGuard)
@Controller({ path: 'people', version: '1' })
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  list(@ActiveUser() user: AuthenticatedUser): Promise<ContactResponse[]> {
    return this.peopleService.listContacts(user.id);
  }

  @Post('dummy')
  createDummy(
    @ActiveUser() user: AuthenticatedUser,
    @Body() dto: CreateContactDto,
  ): Promise<ContactResponse> {
    return this.peopleService.createDummyContact(user.id, dto);
  }
}
