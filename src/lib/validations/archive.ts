import { z } from "zod";

export const createArchiveSchema = z.object({
  name: z
    .string()
    .min(1, "Archive name is required")
    .min(2, "Archive name must be at least 2 characters")
    .max(50, "Archive name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Archive name can only contain letters, numbers, spaces, hyphens, and underscores"
    )
    .trim(),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type CreateArchiveInput = z.infer<typeof createArchiveSchema>;
