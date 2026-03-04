export interface ContactResponse {
  id: string;
  userId: string;
  name: string;
  email?: string | null;
  isDummy: boolean;
  createdAt: string;
}
