import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    category: v.union(v.literal('on_stage'), v.literal('off_stage')),
    day: v.number(),
    date: v.string(),
    time: v.string(),
    venue: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    name: v.optional(v.string()),
    category: v.optional(v.union(v.literal('on_stage'), v.literal('off_stage'))),
    day: v.optional(v.number()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    venue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Delete the event
    await ctx.db.delete(args.id);

    // Cascade delete associated scores
    const eventScores = await ctx.db
      .query("scores")
      .withIndex("by_event", (q) => q.eq("eventId", args.id))
      .collect();
    for (const score of eventScores) {
      await ctx.db.delete(score._id);
    }

    // Cascade delete associated winners
    const eventWinners = await ctx.db
      .query("winners")
      .withIndex("by_event", (q) => q.eq("eventId", args.id))
      .collect();
    for (const winner of eventWinners) {
      await ctx.db.delete(winner._id);
    }
  },
});
