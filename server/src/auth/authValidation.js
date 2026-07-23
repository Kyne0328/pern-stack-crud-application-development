const z = require('zod');
const {validateRequest} = require('../middleware/validateRequest');

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

const credentialsSchema = z.strictObject({
  username: usernameSchema,
  password: passwordSchema,
});

const validateCredentials = validateRequest(credentialsSchema, {
  target: 'authInput',
  message: 'Please correct the account details.',
});

module.exports = {
  credentialsSchema,
  validateCredentials,
};
