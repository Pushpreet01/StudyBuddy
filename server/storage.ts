import { 
  tasks, 
  userProgress, 
  schedules,
  type Task, 
  type InsertTask,
  type UserProgress,
  type InsertUserProgress,
  type Schedule,
  type InsertSchedule,
  type TaskStats
} from "@shared/schema";

export interface IStorage {
  // Task operations
  getTasks(filters?: { completed?: boolean; category?: string; dueDate?: Date }): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // User progress operations
  getUserProgress(): Promise<UserProgress>;
  updateUserProgress(updates: Partial<UserProgress>): Promise<UserProgress>;
  
  // Schedule operations
  getSchedules(): Promise<Schedule[]>;
  getActiveSchedule(): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, updates: Partial<Schedule>): Promise<Schedule | undefined>;
  
  // Analytics
  getTaskStats(): Promise<TaskStats>;
}

export class MemStorage implements IStorage {
  private tasks: Map<number, Task>;
  private userProgress: UserProgress;
  private schedules: Map<number, Schedule>;
  private currentTaskId: number;
  private currentScheduleId: number;

  constructor() {
    this.tasks = new Map();
    this.schedules = new Map();
    this.currentTaskId = 1;
    this.currentScheduleId = 1;
    
    // Initialize user progress
    this.userProgress = {
      id: 1,
      xp: 1250,
      level: 3,
      streak: 7,
      totalStudyTime: 1710, // 28.5 hours in minutes
      completedTasks: 42,
      badges: ["First Week", "Level Up", "Time Master"],
      lastActivityDate: new Date(),
    };

    // Add some initial tasks for demo
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockTasks: InsertTask[] = [
      {
        title: "Complete Math Assignment",
        description: "Finish exercises 1-15 from Chapter 4",
        estimatedTime: 150,
        difficulty: "Hard",
        mood: "Excited",
        scheduleType: "Daily",
        dueDate: new Date(),
        category: "Math"
      },
      {
        title: "Review Science Notes",
        description: "Review chapters 6-8 for upcoming test",
        estimatedTime: 75,
        difficulty: "Medium",
        mood: "Neutral",
        scheduleType: "Daily",
        dueDate: new Date(),
        category: "Science"
      },
      {
        title: "Write History Essay",
        description: "Draft essay on World War II causes",
        estimatedTime: 180,
        difficulty: "Hard",
        mood: "Stressed",
        scheduleType: "Weekly",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        category: "History"
      }
    ];

    // Add mock tasks
    mockTasks.forEach(task => {
      const newTask: Task = {
        ...task,
        id: this.currentTaskId++,
        completed: false,
        createdAt: new Date(),
      };
      this.tasks.set(newTask.id, newTask);
    });

    // Mark one task as completed
    const firstTask = this.tasks.get(2);
    if (firstTask) {
      firstTask.completed = true;
    }
  }

  async getTasks(filters?: { completed?: boolean; category?: string; dueDate?: Date }): Promise<Task[]> {
    let taskList = Array.from(this.tasks.values());

    if (filters) {
      if (filters.completed !== undefined) {
        taskList = taskList.filter(task => task.completed === filters.completed);
      }
      if (filters.category) {
        taskList = taskList.filter(task => task.category === filters.category);
      }
      if (filters.dueDate) {
        const filterDate = filters.dueDate.toDateString();
        taskList = taskList.filter(task => task.dueDate.toDateString() === filterDate);
      }
    }

    return taskList.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: this.currentTaskId++,
      completed: false,
      createdAt: new Date(),
    };
    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);

    // Update user progress if task is completed
    if (updates.completed && !task.completed) {
      await this.updateTaskCompletion(task);
    }

    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getUserProgress(): Promise<UserProgress> {
    return this.userProgress;
  }

  async updateUserProgress(updates: Partial<UserProgress>): Promise<UserProgress> {
    this.userProgress = { ...this.userProgress, ...updates };
    return this.userProgress;
  }

  async getSchedules(): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getActiveSchedule(): Promise<Schedule | undefined> {
    return Array.from(this.schedules.values()).find(schedule => schedule.isActive);
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    // Deactivate previous schedules
    this.schedules.forEach(s => s.isActive = false);

    const newSchedule: Schedule = {
      ...schedule,
      id: this.currentScheduleId++,
      createdAt: new Date(),
      isActive: true,
    };
    this.schedules.set(newSchedule.id, newSchedule);
    return newSchedule;
  }

  async updateSchedule(id: number, updates: Partial<Schedule>): Promise<Schedule | undefined> {
    const schedule = this.schedules.get(id);
    if (!schedule) return undefined;

    const updatedSchedule = { ...schedule, ...updates };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async getTaskStats(): Promise<TaskStats> {
    const allTasks = Array.from(this.tasks.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTasks = allTasks.filter(task => 
      task.dueDate >= today && task.dueDate < tomorrow
    );

    const completedToday = todayTasks.filter(task => task.completed);
    const studyTimeToday = completedToday.reduce((total, task) => total + task.estimatedTime, 0);

    return {
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(task => task.completed).length,
      streak: this.userProgress.streak,
      studyTimeToday: Math.round(studyTimeToday / 60 * 10) / 10, // Convert to hours with 1 decimal
    };
  }

  private async updateTaskCompletion(task: Task): Promise<void> {
    // Calculate XP based on difficulty and mood
    let baseXP = 10;
    const difficultyMultiplier = { Easy: 1, Medium: 1.5, Hard: 2 };
    const moodMultiplier = { Excited: 1.2, Neutral: 1, Stressed: 0.8 };
    
    const xpGained = Math.round(
      baseXP * difficultyMultiplier[task.difficulty] * moodMultiplier[task.mood]
    );

    // Update progress
    this.userProgress.xp += xpGained;
    this.userProgress.completedTasks += 1;
    this.userProgress.totalStudyTime += task.estimatedTime;
    
    // Check for level up (every 500 XP)
    const newLevel = Math.floor(this.userProgress.xp / 500) + 1;
    if (newLevel > this.userProgress.level) {
      this.userProgress.level = newLevel;
      if (!this.userProgress.badges.includes("Level Up")) {
        this.userProgress.badges.push("Level Up");
      }
    }

    // Update streak
    const today = new Date();
    const lastActivity = this.userProgress.lastActivityDate;
    if (lastActivity) {
      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        this.userProgress.streak += 1;
      } else if (daysDiff > 1) {
        this.userProgress.streak = 1;
      }
    } else {
      this.userProgress.streak = 1;
    }

    this.userProgress.lastActivityDate = today;

    // Award badges
    if (this.userProgress.streak >= 7 && !this.userProgress.badges.includes("First Week")) {
      this.userProgress.badges.push("First Week");
    }
    if (this.userProgress.totalStudyTime >= 1500 && !this.userProgress.badges.includes("Time Master")) {
      this.userProgress.badges.push("Time Master");
    }
  }
}

// Switch to Firebase storage
import { FirebaseStorage } from './firebase-storage';
export const storage = new FirebaseStorage();
