import { z } from "zod";

export const userInfoSchema = z
  .object({
    country: z.string().nullish(),
    email: z.string().nullish(),
    name: z.string().nullish(),
    phone_number: z.string().nullish(),
    photo_url: z.string().nullish(),
    uid: z.string().nullish(),
  })
  .passthrough();

export const kpEnvelopeSchema = z
  .object({
    code: z.number().optional(),
    data: z.unknown().optional(),
    is_ok: z.boolean(),
    message: z.string().optional(),
  })
  .passthrough();

export const signResponseSchema = z.object({
  access_token: z.string().min(1),
  level: z.number().nullish(),
  user_info: userInfoSchema,
});
export const signRequestSchema = z.object({ code: z.string().min(1), redirect_uri: z.string().url() });

export const profileResponseSchema = z
  .object({
    level: z.number().nullish(),
    member_info: userInfoSchema.extend({ level: z.number().nullish() }).optional(),
    user_info: userInfoSchema.optional(),
  })
  .passthrough();

export const refreshResponseSchema = z.object({ access_token: z.string().min(1) }).passthrough();
export const checkoutTokenResponseSchema = z.object({ token: z.string().min(1) });

export type KpUserInfo = z.infer<typeof userInfoSchema>;
export type SignResponse = z.infer<typeof signResponseSchema>;
export type SignRequest = z.input<typeof signRequestSchema>;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;
