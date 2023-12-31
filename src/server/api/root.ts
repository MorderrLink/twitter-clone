import { postRouter } from "~/server/api/routers/post";
import { createTRPCRouter } from "~/server/api/trpc";
import { tweetRouter } from "~/server/api/routers/tweet";
import { profileRouter } from "./routers/profile";
import { userRouter } from "./routers/user";
import { followsRouter } from "./routers/follows";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  tweet: tweetRouter,
  profile: profileRouter,
  user: userRouter,
  follows: followsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
