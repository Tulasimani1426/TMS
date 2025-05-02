import { users, tasks, notifications, type User, type InsertUser, type Task, type InsertTask, type Notification, type InsertNotification } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db, pool } from "./db";
import { eq, and, lt, ne, or } from "drizzle-orm";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksByAssignedTo(userId: number): Promise<Task[]>;
  getTasksByCreatedBy(userId: number): Promise<Task[]>;
  getOverdueTasks(userId: number): Promise<Task[]>;
  getAllTasks(): Promise<Task[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private notifications: Map<number, Notification>;
  sessionStore: any;
  currentUserId: number;
  currentTaskId: number;
  currentNotificationId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.notifications = new Map();
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentNotificationId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create an initial admin user
    this.createUser({
      username: "admin",
      password: "adminpassword", // This will be hashed in auth.ts
      name: "Admin User",
      role: "Administrator",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const now = new Date();
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: now, 
      updatedAt: now
    };
    this.tasks.set(id, task);
    
    // If the task is assigned to someone, create a notification
    if (task.assignedToId && task.assignedToId !== task.createdById) {
      const creator = this.users.get(task.createdById);
      const creatorName = creator ? creator.name : "Someone";
      
      this.createNotification({
        userId: task.assignedToId,
        message: `${creatorName} assigned you a new task: ${task.title}`,
        taskId: task.id,
        read: false
      });
    }
    
    return task;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const prevAssignedToId = task.assignedToId;
    
    const updatedTask: Task = {
      ...task,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.tasks.set(id, updatedTask);
    
    // If the assigned user changed, create a notification
    if (updateData.assignedToId && 
        updateData.assignedToId !== prevAssignedToId && 
        updateData.assignedToId !== task.createdById) {
      const creator = this.users.get(task.createdById);
      const creatorName = creator ? creator.name : "Someone";
      
      this.createNotification({
        userId: updateData.assignedToId,
        message: `${creatorName} assigned you a task: ${task.title}`,
        taskId: task.id,
        read: false
      });
    }
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getTasksByAssignedTo(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assignedToId === userId
    );
  }

  async getTasksByCreatedBy(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.createdById === userId
    );
  }

  async getOverdueTasks(userId: number): Promise<Task[]> {
    const now = new Date();
    return Array.from(this.tasks.values()).filter(
      (task) => 
        task.dueDate && 
        new Date(task.dueDate) < now && 
        task.status !== "completed" && 
        (task.assignedToId === userId || task.createdById === userId)
    );
  }
  
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  // Notification operations
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const now = new Date();
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: now
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.read = true;
    this.notifications.set(id, notification);
    return true;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure optional fields are explicitly set to null if undefined
    const userValues = {
      ...insertUser,
      role: insertUser.role ?? null,
      avatar: insertUser.avatar ?? null
    };
    
    const [user] = await db.insert(users).values(userValues).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    // Ensure optional fields are explicitly set to null if undefined
    const taskValues = {
      ...insertTask,
      description: insertTask.description ?? null,
      dueDate: insertTask.dueDate ?? null,
      estimatedHours: insertTask.estimatedHours ?? null,
      assignedToId: insertTask.assignedToId ?? null
    };
    
    const [task] = await db.insert(tasks).values(taskValues).returning();
    
    // If the task is assigned to someone, create a notification
    if (task.assignedToId && task.assignedToId !== task.createdById) {
      const [creator] = await db.select().from(users).where(eq(users.id, task.createdById));
      const creatorName = creator ? creator.name : "Someone";
      
      await this.createNotification({
        userId: task.assignedToId,
        message: `${creatorName} assigned you a new task: ${task.title}`,
        taskId: task.id,
        read: false
      });
    }
    
    return task;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) return undefined;
    
    const prevAssignedToId = task.assignedToId;
    
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    
    // If the assigned user changed, create a notification
    if (updateData.assignedToId && 
        updateData.assignedToId !== prevAssignedToId && 
        updateData.assignedToId !== task.createdById) {
      const [creator] = await db.select().from(users).where(eq(users.id, task.createdById));
      const creatorName = creator ? creator.name : "Someone";
      
      await this.createNotification({
        userId: updateData.assignedToId,
        message: `${creatorName} assigned you a task: ${task.title}`,
        taskId: task.id,
        read: false
      });
    }
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getTasksByAssignedTo(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignedToId, userId));
  }

  async getTasksByCreatedBy(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.createdById, userId));
  }

  async getOverdueTasks(userId: number): Promise<Task[]> {
    const now = new Date();
    return await db.select().from(tasks).where(
      and(
        lt(tasks.dueDate, now),
        ne(tasks.status, "completed"),
        or(
          eq(tasks.assignedToId, userId),
          eq(tasks.createdById, userId)
        )
      )
    );
  }
  
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    // Ensure optional fields are explicitly set to null if undefined
    const notificationValues = {
      ...insertNotification,
      taskId: insertNotification.taskId ?? null,
      read: insertNotification.read ?? false
    };
    
    const [notification] = await db.insert(notifications).values(notificationValues).returning();
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt);
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

// Switch to using the database storage
export const storage = new DatabaseStorage();
