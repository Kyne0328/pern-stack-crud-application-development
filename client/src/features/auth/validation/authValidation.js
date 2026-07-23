import * as z from 'zod';

const usernameSchema = z.preprocess(
  (value) => typeof value === 'string' ? value.trim().toLowerCase() : '',
  z.string()
    .min(1, {error: 'Username is required.'})
    .min(3, {error: 'Username must contain at least 3 characters.'})
    .max(50, {error: 'Username must not exceed 50 characters.'})
    .regex(/^[a-z0-9._-]+$/, {
      error: 'Username may only contain letters, numbers, dots, underscores, and hyphens.',
    }),
);

const passwordSchema = z.preprocess(
  (value) => typeof value === 'string' ? value : '',
  z.string()
    .min(1, {error: 'Password is required.'})
    .min(8, {error: 'Password must contain at least 8 characters.'})
    .max(128, {error: 'Password must not exceed 128 characters.'}),
);

export const authInputSchema = z.strictObject({
  username: usernameSchema,
  password: passwordSchema,
});

export function validateAuthInput(values) {
  const result = authInputSchema.safeParse(values);

  if (!result.success) {
    return {
      data: null,
      error: result.error.issues[0]?.message || 'Enter valid account details.',
      isValid: false,
    };
  }

  return {data: result.data, error: '', isValid: true};
}
