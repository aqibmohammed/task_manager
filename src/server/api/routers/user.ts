import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { userTable } from "~/server/db/schema";
import { eq, or } from "drizzle-orm";
import { lucia } from "~/lib/auth";
import { cookies } from "next/headers";
import { hash, verify } from "@node-rs/argon2";
import { db } from "~/server/db";
import { randomUUID } from "crypto";

export const userRouter = createTRPCRouter({
    registerUser: publicProcedure
        .input(
            z.object({
                username: z.string().min(1),
                email: z.string().email(),
                password: z.string().min(6).max(255),
            }),
        )
        .mutation(async ({ input: { username, email, password }}) => {
            // Check if email already exists
            const existingUser = await db
                .select({ email: userTable.email })
                .from(userTable)
                .where(eq(userTable.email, email))
                .limit(1);

            if (existingUser.length > 0) {
                throw new Error("Email already exists");
            }

            const passwordHash = await hash(password, {
                memoryCost: 19456,
                timeCost: 2,
                outputLen: 32,
                parallelism: 1,
            });

            // Insert user with hashed password
            await db.insert(userTable).values({
                id: randomUUID(),
                username,
                email,
                passwordHash,
            });

            return { success: true };
        }),

    login: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string().min(1),
            }),
        )
        .mutation(async ({ input: { email, password }, ctx }) => {
            console.log({ host: ctx.host });

            const response = await db
                .select({
                    id: userTable.id,
                    name: userTable.username,
                    email: userTable.email,
                    password: userTable.passwordHash,
                })
                .from(userTable)
                .where(eq(userTable.email, email))
                .limit(1);
            
            const user = response[0];

            if (!user) {
                throw new Error("User not found");
            }

            const validPassword = await verify(user.password, password);
            if (!validPassword) {
                throw new Error("Incorrect email or password");
            }

            const session = await lucia.createSession(user.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);

            (await cookies()).set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes,
            );

            return { 
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                }
            };
        }),

    getUser: protectedProcedure.query(async ({ ctx }) => {
        const user = await db.query.userTable.findFirst({
            where: eq(userTable.id, ctx.user.id),
        });

        if (!user) {
            throw new Error("User not found");
        }

        return {
            id: user.id,
            name: user.username,
            email: user.email,
            createdAt: user.createdAt
        };
    }),

    logout: protectedProcedure.mutation(async ({ ctx }) => {
        await lucia.invalidateSession(ctx.session.id);
    
        const sessionCookie = lucia.createBlankSessionCookie();
    
        (await cookies()).set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
        );
    
        return { success: true };
    }),
});