import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"), // URL to avatar image
  role: text("role"), // e.g., "Product Manager", "Developer"
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  avatar: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Priority types: "low", "medium", "high"
// Status types: "to-do", "in-progress", "completed", "blocked"
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: text("priority").notNull(), // low, medium, high
  status: text("status").notNull(), // to-do, in-progress, completed, blocked
  estimatedHours: integer("estimated_hours"),
  createdById: integer("created_by_id").notNull(), // Reference to user who created
  assignedToId: integer("assigned_to_id"), // Optional reference to assigned user
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Schema for notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // User to notify
  message: text("message").notNull(),
  taskId: integer("task_id"), // Related task if applicable
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  createdTasks: many(tasks, { relationName: "creator" }),
  assignedTasks: many(tasks, { relationName: "assignee" }),
  notifications: many(notifications)
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  creator: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: "creator"
  }),
  assignee: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: "assignee"
  })
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  }),
  task: one(tasks, {
    fields: [notifications.taskId],
    references: [tasks.id]
  })
}));
