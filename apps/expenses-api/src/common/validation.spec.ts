import type { ValidationError } from '@nestjs/common';
import { buildValidationErrorResponse } from './validation';

describe('buildValidationErrorResponse', () => {
  it('maps validation errors to field map', () => {
    const errors: ValidationError[] = [
      {
        property: 'email',
        constraints: {
          isEmail: 'email must be an email',
        },
        children: [],
      },
      {
        property: 'password',
        constraints: {
          minLength: 'password must be longer than 8 characters',
        },
        children: [],
      },
    ];

    const result = buildValidationErrorResponse(errors);

    expect(result.message).toBe('Validation failed');
    expect(result.errors).toEqual({
      email: 'email must be an email',
      password: 'password must be longer than 8 characters',
    });
  });
});
