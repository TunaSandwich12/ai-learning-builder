import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().pipe(z.email("Enter a valid email address.")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

export type Credentials = z.infer<typeof credentialsSchema>;

// What the login form shows after a submit.
export type AuthState = {
  error?: string;
  message?: string;
  email?: string;
};
