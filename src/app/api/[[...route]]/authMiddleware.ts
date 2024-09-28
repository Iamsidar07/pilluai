import { auth } from "@clerk/nextjs/server";

export const authMiddleware = async (c) => {
  const { userId } = auth().protect();
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  c.user = { userId };
};
