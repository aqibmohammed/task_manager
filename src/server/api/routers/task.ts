import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
// import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { db } from "~/server/db";
import { tasks } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// Create a new task
export const taskRouter = createTRPCRouter({
  createTask: publicProcedure
    .input(z.object({ title: z.string(), description: z.string().optional(),status: z.enum(["pending", "in-progress", "completed"]), }))
    .mutation(async ({ input }) => {
      return await db.insert(tasks).values({ title: input.title, description: input.description, status: input.status, });
    }),

  getTasks: publicProcedure
    .query(async () => {
      return await db.select().from(tasks);
    }),

  updateTask: publicProcedure
    .input(z.object({ id: z.string(), status: z.enum(["pending", "in-progress", "completed"]) }))
    .mutation(async ({ input }) => {
      return await db.update(tasks).set({ status: input.status }).where(eq(tasks.id, input.id));
    }),

  deleteTask: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.delete(tasks).where(eq(tasks.id, input.id));
    }),

    getTasksfilter: publicProcedure
  .input(z.object({ status: z.enum(["pending", "in-progress", "completed"]).optional(), page: z.number().default(1), pageSize: z.number().default(10) }))
  .query(async ({ input }) => {
    const { status, page, pageSize } = input;
    const query = db.select().from(tasks);
    
    if (status) {
      query.where(eq(tasks.status, status));
    }
    
    query.limit(pageSize).offset((page - 1) * pageSize);
    return await query;
  }),

});

