import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  estimatedTime: integer("estimated_time").notNull(), // in minutes
  difficulty: text("difficulty", { enum: ["Easy", "Medium", "Hard"] }).notNull().default("Medium"),
  mood: text("mood", { enum: ["Excited", "Neutral", "Stressed"] }).notNull().default("Neutral"),
  scheduleType: text("schedule_type", { enum: ["Daily", "Weekly", "Monthly"] }).notNull().default("Daily"),
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date").notNull(),
  category: text("category").default("General"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  totalStudyTime: integer("total_study_time").notNull().default(0), // in minutes
  completedTasks: integer("completed_tasks").notNull().default(0),
  badges: jsonb("badges").$type<string[]>().default([]),
  lastActivityDate: timestamp("last_activity_date"),
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  scheduleData: jsonb("schedule_data").$type<ScheduleBlock[]>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completed: true,
}).extend({
  dueDate: z.string().transform((str) => new Date(str)),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true,
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export interface ScheduleBlock {
  timeBlock: string;
  title: string;
  description?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  priority: number;
  taskId?: number;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  streak: number;
  studyTimeToday: number;
}
