import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';
import { contacts, type Contact } from '../database/schema';
import { CreateContactDto } from './dto/create-contact.dto';
import type { ContactResponse } from './people.types';

@Injectable()
export class PeopleService {
  constructor(private readonly drizzle: DrizzleService) {}

  async listContacts(userId: string): Promise<ContactResponse[]> {
    const rows = await this.drizzle.db
      .select()
      .from(contacts)
      .where(eq(contacts.userId, userId));

    return rows.map((contact) => this.serialize(contact));
  }

  async createDummyContact(
    userId: string,
    dto: CreateContactDto,
  ): Promise<ContactResponse> {
    const [created] = await this.drizzle.db
      .insert(contacts)
      .values({
        userId,
        name: dto.name,
        email: dto.email ?? null,
        isDummy: true,
      })
      .returning();

    return this.serialize(created);
  }

  private serialize(contact: Contact): ContactResponse {
    return {
      id: contact.id,
      userId: contact.userId,
      name: contact.name,
      email: contact.email,
      isDummy: contact.isDummy,
      createdAt: contact.createdAt.toISOString(),
    };
  }
}
