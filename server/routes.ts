import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
// Fetch tasks assigned to the logged-in user
app.get("/api/tasks/assigned", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const tasks = await storage.getTasksByAssignedTo(userId); // Fetch tasks assigned to user
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assigned tasks" });
  }
});

  // Get all users (for task assignment)
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't return password hashes
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Task routes
  // Get all tasks for the current user
  app.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const assignedTasks = await storage.getTasksByAssignedTo(userId);
      const createdTasks = await storage.getTasksByCreatedBy(userId);
      
      // Combine and deduplicate tasks
      const taskMap = new Map();
      [...assignedTasks, ...createdTasks].forEach(task => {
        taskMap.set(task.id, task);
      });
      
      const tasks = Array.from(taskMap.values());
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  
  // Get assigned tasks
  app.get("/api/tasks/assigned", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const tasks = await storage.getTasksByAssignedTo(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assigned tasks" });
    }
  });
  
  // Get created tasks
  app.get("/api/tasks/created", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const tasks = await storage.getTasksByCreatedBy(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch created tasks" });
    }
  });
  
  // Get overdue tasks
  app.get("/api/tasks/overdue", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const tasks = await storage.getOverdueTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch overdue tasks" });
    }
  });

  // Create a new task
  app.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const taskData = insertTaskSchema.parse({
        ...req.body,
        createdById: userId,
      });
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  // Update a task
  app.patch("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Only allow update if user created the task or is assigned to it
      const userId = req.user!.id;
      if (task.createdById !== userId && task.assignedToId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this task" });
      }
      
      // Use the same schema for validation as we do for task creation
      // but make a partial schema for updates
      const taskUpdateSchema = z.object({
        title: insertTaskSchema.shape.title.optional(),
        description: insertTaskSchema.shape.description.optional(),
        dueDate: insertTaskSchema.shape.dueDate.optional(),
        priority: insertTaskSchema.shape.priority.optional(),
        status: insertTaskSchema.shape.status.optional(),
        estimatedHours: insertTaskSchema.shape.estimatedHours.optional(),
        assignedToId: insertTaskSchema.shape.assignedToId.optional(),
      });
      
      const validatedData = taskUpdateSchema.parse(req.body);
      const updatedTask = await storage.updateTask(taskId, validatedData);
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Only allow deletion if user created the task
      const userId = req.user!.id;
      if (task.createdById !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this task" });
      }
      
      const deleted = await storage.deleteTask(taskId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete task" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Notification routes
  // Get user's notifications
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const marked = await storage.markNotificationAsRead(notificationId);
      if (marked) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Notification not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
