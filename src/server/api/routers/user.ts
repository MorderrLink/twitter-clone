import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";



export const userRouter = createTRPCRouter({
    getIsAdmin: publicProcedure
    .query(async ({ ctx }) => {
        const currentUserId = ctx.session?.user.id
        return await ctx.db.user.findUnique({ where: { id: currentUserId }, select: {isAdmin: true}})

        
    }),
    getIsBanned: publicProcedure
    .query(async ({ ctx }) => {
        const currentUserId = ctx.session?.user.id
        return await ctx.db.user.findUnique({ where: { id: currentUserId }, select: {isBanned: true}})
    }),
    getIsAnotherBanned: publicProcedure
    .input(z.object({id: z.string()}))
    .query(async ({input: {id: id}, ctx}) => {
        const user = await ctx.db.user.findUnique({where: { id: id }, select: { isBanned: true }})
        return user
    })
})