import { ApiError } from "./api-client";

type ErrorDetails = {
  errors?: Record<string, string | string[]>;
  message?: string | string[];
};

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) {
    return {};
  }

  const details = error.details as ErrorDetails | undefined;

  if (details?.errors && typeof details.errors === "object") {
    return Object.entries(details.errors).reduce<Record<string, string>>(
      (acc, [field, value]) => {
        if (Array.isArray(value)) {
          acc[field] = value[0] ?? "Invalid value";
        } else if (typeof value === "string") {
          acc[field] = value;
        }
        return acc;
      },
      {},
    );
  }

  if (Array.isArray(details?.message)) {
    return details.message.reduce<Record<string, string>>((acc, message) => {
      const field = String(message).split(" ")[0];
      if (field) {
        acc[field] = String(message);
      }
      return acc;
    }, {});
  }

  return {};
}

export function getFieldError(error: unknown, field: string): string | undefined {
  const errors = getFieldErrors(error);
  return errors[field];
}
