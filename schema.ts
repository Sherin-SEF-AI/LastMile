import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Simulation Data Models

export const responders = pgTable("responders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  skills: text("skills").array().notNull(),
  location: text("location").notNull(),
  distance: integer("distance").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  profileImage: text("profile_image").notNull(),
});

export const insertResponderSchema = createInsertSchema(responders).pick({
  name: true,
  skills: true,
  location: true,
  distance: true,
  isAvailable: true,
  profileImage: true,
});

export type InsertResponder = z.infer<typeof insertResponderSchema>;
export type Responder = typeof responders.$inferSelect;

export const safeHavens = pgTable("safe_havens", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  location: text("location").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertSafeHavenSchema = createInsertSchema(safeHavens).pick({
  name: true,
  type: true,
  location: true,
  isActive: true,
});

export type InsertSafeHaven = z.infer<typeof insertSafeHavenSchema>;
export type SafeHaven = typeof safeHavens.$inferSelect;
