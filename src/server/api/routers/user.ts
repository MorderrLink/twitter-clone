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
    }),
    getIsNotificationsOn: publicProcedure
    .input(z.object({id : z.string()}))
    .query(async ({input: {id: id}, ctx}) => {
        return await ctx.db.user.findUnique({ where: { id: id }, select: {notificationsOn: true}})
    }),
    setNotifications: publicProcedure
    .input(z.object({id : z.string(), NotifFlag: z.boolean()}))
    .mutation(async ({input: {id : userId, NotifFlag: NotifFlag}, ctx}) => {
         
        if (NotifFlag) {
            await ctx.db.user.update({where: {id: userId}, data: { notificationsOn: false } })
        } else { 
            await ctx.db.user.update({where: {id: userId}, data: { notificationsOn: true } })
        }
    }),

})