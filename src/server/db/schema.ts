// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
  pgTable, text, uuid, pgEnum
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";


/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const statusEnum = pgEnum("status", ["pending", "in-progress", "completed"]);
export const roleEnum = pgEnum("role", ["admin", "user"]);

export const createTable = pgTableCreator((name) => `task_manager_${name}`);


export const tasks = createTable("tasks", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: statusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});


  

export const userTable = createTable("usertable", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const sessionTable = createTable("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  })
);



 
