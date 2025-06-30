import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertScheduleSchema, type ScheduleBlock } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const { completed, category, dueDate } = req.query;
      const filters: any = {};
      
      if (completed !== undefined) {
        filters.completed = completed === 'true';
      }
      if (category) {
        filters.category = category as string;
      }
      if (dueDate) {
        filters.dueDate = new Date(dueDate as string);
      }

      const tasks = await storage.getTasks(filters);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      
      // Basic content filtering (simple implementation)
      const inappropriateWords = ['spam', 'fake', 'scam'];
      const containsInappropriate = inappropriateWords.some(word => 
        taskData.title.toLowerCase().includes(word) || 
        (taskData.description && taskData.description.toLowerCase().includes(word))
      );
      
      if (containsInappropriate) {
        return res.status(400).json({ message: "Task contains inappropriate content" });
      }

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

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const task = await storage.updateTask(id, updates);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // User progress routes
  app.get("/api/progress", async (req, res) => {
    try {
      const progress = await storage.getUserProgress();
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getTaskStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Schedule routes
  app.get("/api/schedules", async (req, res) => {
    try {
      const schedules = await storage.getSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  app.get("/api/schedules/active", async (req, res) => {
    try {
      const schedule = await storage.getActiveSchedule();
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active schedule" });
    }
  });

  app.post("/api/schedules/generate", async (req, res) => {
    try {
      const tasks = await storage.getTasks({ completed: false });
      
      if (tasks.length === 0) {
        return res.status(400).json({ message: "No tasks available for scheduling" });
      }

      // Generate schedule using Hugging Face API
      const scheduleBlocks = await generateAISchedule(tasks);
      
      const schedule = await storage.createSchedule({
        title: `AI Schedule - ${new Date().toLocaleDateString()}`,
        scheduleData: scheduleBlocks,
      });

      res.status(201).json(schedule);
    } catch (error) {
      console.error("Schedule generation error:", error);
      
      // Fallback schedule generation
      const tasks = await storage.getTasks({ completed: false });
      const fallbackSchedule = generateFallbackSchedule(tasks);
      
      const schedule = await storage.createSchedule({
        title: `Fallback Schedule - ${new Date().toLocaleDateString()}`,
        scheduleData: fallbackSchedule,
      });

      res.status(201).json(schedule);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function generateAISchedule(tasks: any[]): Promise<ScheduleBlock[]> {
  const HF_API_KEY = process.env.HUGGING_FACE_API_KEY || process.env.HF_API_KEY || "";
  
  if (!HF_API_KEY) {
    throw new Error("Hugging Face API key not found");
  }

  // Prepare prompt for Hugging Face
  const taskSummary = tasks.map(task => 
    `Task: ${task.title}, Time: ${task.estimatedTime}min, Difficulty: ${task.difficulty}, Mood: ${task.mood}`
  ).join('\n');

  const prompt = `Create a study schedule for these tasks. Return only a JSON array of schedule blocks.
Tasks to schedule:
${taskSummary}

Format each block as: {"timeBlock": "HH:MM-HH:MM", "title": "Task Name", "description": "Brief description", "difficulty": "Easy|Medium|Hard", "priority": 1-5}

Include 15-minute breaks between study sessions. Start at 09:00.`;

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/distilgpt2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 500,
          temperature: 0.7,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const result = await response.json();
    const generatedText = result[0]?.generated_text || "";
    
    // Try to extract JSON from the generated text
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const scheduleData = JSON.parse(jsonMatch[0]);
      return scheduleData;
    }
    
    throw new Error("No valid JSON found in generated response");
  } catch (error) {
    console.error("Hugging Face API call failed:", error);
    throw error;
  }
}

function generateFallbackSchedule(tasks: any[]): ScheduleBlock[] {
  const schedule: ScheduleBlock[] = [];
  let currentTime = 9 * 60; // 9:00 AM in minutes
  
  tasks.slice(0, 5).forEach((task, index) => {
    const startHour = Math.floor(currentTime / 60);
    const startMin = currentTime % 60;
    const endTime = currentTime + task.estimatedTime;
    const endHour = Math.floor(endTime / 60);
    const endMinute = endTime % 60;
    
    schedule.push({
      timeBlock: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}-${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
      title: task.title,
      description: task.description || `${task.difficulty} difficulty task`,
      difficulty: task.difficulty,
      priority: task.difficulty === 'Hard' ? 3 : task.difficulty === 'Medium' ? 2 : 1,
      taskId: task.id,
    });
    
    currentTime = endTime + 15; // Add 15-minute break
    
    // Add break block (except after last task)
    if (index < tasks.length - 1 && index < 4) {
      const breakEndTime = currentTime;
      const breakEndHour = Math.floor(breakEndTime / 60);
      const breakEndMin = breakEndTime % 60;
      
      schedule.push({
        timeBlock: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}-${breakEndHour.toString().padStart(2, '0')}:${breakEndMin.toString().padStart(2, '0')}`,
        title: "Break",
        description: "15 minute rest",
        difficulty: "Easy",
        priority: 0,
      });
    }
  });
  
  return schedule;
}
