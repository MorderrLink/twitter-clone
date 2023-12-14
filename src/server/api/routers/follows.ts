import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";



export const followsRouter = createTRPCRouter({
    addFollow: protectedProcedure
    .input(z.object({follower: z.string(), follow: z.string()}))
    .mutation(async ({input: {follow: following, follower: follower}, ctx}) => {
        const existingFollow = await ctx.db.follow.findFirst({where: { follower: follower, following: following }})
        if (existingFollow == null) {
            const follow = await ctx.db.follow.create({data: {follower: follower, following: following}})
            console.log("Created follow:", follower, "to", following)
            return follow;
        } else {
            await ctx.db.follow.delete({where: {id: existingFollow.id}})
            return "Success"
        }
    }),
    getFollowers: publicProcedure
    .input(z.object({id: z.string()}))
    .query( async ({input: {id: id}, ctx}) => {
        const followers = await ctx.db.user.findMany({ where: { follows: { some: {id: id} } }, select: {id: true, email: true}} )
        console.log("FOLLOWERS", followers)
        // if (followers == null) return null
        return followers;
    }),
    
})