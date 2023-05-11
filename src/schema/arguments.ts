import { z } from "zod";

export const required = z.object({
  target: z.string().nonempty(),
  apiKey: z.string().nonempty(),
});

export const optional = z.object({
  color: z.record(z.string()).optional(),
});

export type Option = z.infer<typeof optional>;
