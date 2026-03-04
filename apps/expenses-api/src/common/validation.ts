import type { ValidationError } from '@nestjs/common';

export function buildValidationErrorResponse(errors: ValidationError[]) {
  const fieldErrors: Record<string, string> = {};

  errors.forEach((error) => {
    if (error.constraints) {
      const [message] = Object.values(error.constraints);
      if (message) {
        fieldErrors[error.property] = message;
      }
    }
  });

  return {
    message: 'Validation failed',
    errors: fieldErrors,
  };
}
