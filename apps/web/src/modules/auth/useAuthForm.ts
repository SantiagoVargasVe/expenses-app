import { useCallback, useMemo, useState } from "react";
import { z } from "zod";

export type AuthFormMode = "login" | "signup";

export interface AuthFormValues {
  email: string;
  password: string;
  confirmPassword?: string;
}
export type AuthFormField = keyof AuthFormValues;

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string(),
  confirmPassword: z.string().optional(),
});

const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export interface UseAuthFormOptions {
  initialValues?: Partial<AuthFormValues>;
  mode: AuthFormMode;
  onSubmit: (values: AuthFormValues) => Promise<void> | void;
}

type FieldErrorMap = Partial<Record<AuthFormField, string | undefined>>;

export function useAuthForm({ initialValues, mode, onSubmit }: UseAuthFormOptions) {
  const defaults = useMemo<AuthFormValues>(
    () => ({
      email: initialValues?.email ?? "",
      password: initialValues?.password ?? "",
      confirmPassword:
        initialValues?.confirmPassword ?? (mode === "signup" ? "" : undefined),
    }),
    [initialValues, mode],
  );

  const activeSchema = useMemo(() => {
    return mode === "signup" ? signupSchema : loginSchema;
  }, [mode]);

  const [values, setValues] = useState<AuthFormValues>(defaults);
  const [errors, setErrors] = useState<FieldErrorMap>({});

  const setFieldError = useCallback((field: AuthFormField, error?: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const validateField = useCallback(
    (field: AuthFormField): boolean => {
      const fieldSchema =
        activeSchema.shape[field as keyof typeof activeSchema.shape];
      if (!fieldSchema) {
        return true;
      }

      const result = fieldSchema.safeParse(values[field]);
      if (result.success) {
        setFieldError(field, undefined);
        return true;
      }

      const [message] = result.error.issues;
      setFieldError(field, message?.message ?? "Invalid value");
      return false;
    },
    [activeSchema, setFieldError, values],
  );

  const validateAll = useCallback((): boolean => {
    const parsed = activeSchema.safeParse(values);

    if (parsed.success) {
      setErrors({});
      return true;
    }

    const nextErrors: FieldErrorMap = {};
    const { fieldErrors } = parsed.error.flatten();

    (Object.keys(fieldErrors) as AuthFormField[]).forEach((field) => {
      const [message] = fieldErrors[field] ?? [];
      if (message) {
        nextErrors[field] = message;
      }
    });

    setErrors(nextErrors);
    return false;
  }, [activeSchema, values]);

  const handleChange = useCallback(
    (field: AuthFormField, value: string) => {
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));
      setFieldError(field, undefined);
    },
    [setFieldError],
  );

  const handleBlur = useCallback(
    (field: AuthFormField) => {
      validateField(field);
    },
    [validateField],
  );

  const handleSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      if (event) {
        event.preventDefault();
      }

      if (!validateAll()) {
        return;
      }

      await onSubmit(values);
    },
    [onSubmit, validateAll, values],
  );

  const reset = useCallback(() => {
    setValues(defaults);
    setErrors({});
  }, [defaults]);

  return {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
  };
}
