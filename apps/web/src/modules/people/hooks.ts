import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDummyContact, getContacts } from "./api";
import type { Contact, CreateContactPayload } from "./types";

const peopleQueryKey = ["people"] as const;

export function usePeopleQuery() {
  return useQuery({
    queryKey: peopleQueryKey,
    queryFn: getContacts,
  });
}

export function useCreateContactMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateContactPayload) => createDummyContact(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<Contact[]>(peopleQueryKey, (prev) =>
        prev ? [...prev, data] : [data],
      );
    },
  });
}
