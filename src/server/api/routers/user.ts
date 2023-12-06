import { createTRPCRouter, publicProcedure } from "../trpc";



export const userRouter = createTRPCRouter({
    getIsAdmin: publicProcedure
    .query(async ({ ctx }) => {
        const currentUserId = ctx.session?.user.id
        return await ctx.db.user.findUnique({ where: { id: currentUserId }, select: {isAdmin: true}})

        
    })
})