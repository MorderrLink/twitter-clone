import type { Prisma } from "@prisma/client";
import type { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

import type { createTRPCContext } from "~/server/api/trpc";

export const tweetRouter = createTRPCRouter({
  infiniteProfileFeed: publicProcedure
  .input(z.object({
    userId: z.string(),
    limit: z.number().optional(),
    cursor: z.object({ id: z.string(), createdAt: z.date()}).optional()
  }))
  .query(async ({ input: {limit = 10, cursor, userId}, ctx }) => {
    return await getInfiniteTweets({
       limit,
       cursor,
       ctx,
       whereClause: { userId } 
      });
  }),
  infiniteFeed: publicProcedure
    .input(z.object({
       onlyFollowing: z.boolean().optional(),
       limit: z.number().optional(),
       cursor: z.object({ id: z.string(), createdAt: z.date()}).optional(),
    })
  ).query(async ({ input: {limit = 10, cursor, onlyFollowing = false}, ctx }) => {
    const currentUserId = ctx.session?.user.id
    return await getInfiniteTweets({ limit, cursor, ctx, whereClause: currentUserId == null || !onlyFollowing ? undefined : {
      user: {
        followers: {
          some: { id: currentUserId}
        }
      }
    }})
  }),

  create: protectedProcedure
    .input(z.object({ content: z.string().min(1), fileUrl: z.string().optional(), fileType: z.string().optional() }))
    .mutation(async ({ input:{ content, fileUrl, fileType }, ctx }) => {
        const tweet = ctx.db.tweet.create({ data: {content, userId: ctx.session.user.id, fileUrl: fileUrl, fileType: fileType} })

        void ctx.revalidateSSG?.(`/profiles/${ctx.session.user.id}`)

        return tweet;
    }),
  
  toggleLike: protectedProcedure
    .input(z.object({ id: z.string()}))
    .mutation(async ({input: { id }, ctx}) => {
      const data = { tweetId: id, userId: ctx.session.user.id }
      const existingLike = await ctx.db.like.findUnique({
        where: { userId_tweetId: data }
      })

      if (existingLike == null) {
        await ctx.db.like.create({data})
        return { addedLike: true }
      } else {
        await ctx.db.like.delete({where: {userId_tweetId: data}})
        return { addedLike: false }
      }

    }),

    delete: protectedProcedure
    .input(z.object({ tweetId: z.string() }))
    .mutation(async ({ input: {tweetId}, ctx }) => {
      await ctx.db.tweet.delete({ where: {
        id: tweetId
      } })
    })
});


async function getInfiniteTweets({
  whereClause,
  ctx,
  limit,
  cursor
} : {whereClause?: Prisma.TweetWhereInput,
   limit: number,
   cursor: {id: string, createdAt: Date} | undefined,
   ctx: inferAsyncReturnType<typeof createTRPCContext>
  }) {
  const currentUserId = ctx.session?.user.id

  const data = await ctx.db.tweet.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    select: {
      id: true,
      content: true,
      createdAt: true,
      _count: { select: { likes: true } },
      likes:
        currentUserId == null ? false : { where: { userId: currentUserId } },
      user: {
        select: { name: true, id: true, image: true },
      },
      fileUrl: true,
      fileType: true
    },
  });

  let nextCursor: typeof cursor | undefined;
  if (data.length > limit) {
    const nextItem = data.pop();
    if (nextItem != null) {
      nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
    }
  }

  return {
    tweets: data.map((tweet) => {
      return {
        id: tweet.id,
        content: tweet.content,
        createdAt: tweet.createdAt,
        likeCount: tweet._count.likes,
        user: tweet.user,
        likedByMe: tweet.likes?.length > 0,
        fileUrl: tweet.fileUrl,
        fileType: tweet.fileType
      };
    }),
    nextCursor,
  };
}