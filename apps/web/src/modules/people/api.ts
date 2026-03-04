import { apiRequest } from "../../lib/api-client";
import type { Contact, CreateContactPayload } from "./types";

const PEOPLE_ENDPOINT = "/people";

export function getContacts(): Promise<Contact[]> {
  return apiRequest<Contact[]>(PEOPLE_ENDPOINT);
}

export function createDummyContact(
  payload: CreateContactPayload,
): Promise<Contact> {
  return apiRequest<Contact>(`${PEOPLE_ENDPOINT}/dummy`, {
    method: "POST",
    body: payload,
  });
}
