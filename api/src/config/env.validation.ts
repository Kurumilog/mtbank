import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  PORT: Joi.number().default(3000),
});
