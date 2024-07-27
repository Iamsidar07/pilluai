import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
});

export default signupSchema;
