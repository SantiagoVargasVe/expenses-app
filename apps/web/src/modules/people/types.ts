export interface Contact {
  id: string;
  userId: string;
  name: string;
  email?: string | null;
  isDummy: boolean;
  createdAt: string;
}

export interface CreateContactPayload {
  name: string;
  email?: string;
}
