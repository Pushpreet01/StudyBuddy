import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase-config';
import { 
  type Task, 
  type InsertTask,
  type UserProgress,
  type InsertUserProgress,
  type Schedule,
  type InsertSchedule,
  type TaskStats
} from '@shared/schema';
import { type IStorage } from './storage';

export class FirebaseStorage implements IStorage {
  private readonly COLLECTIONS = {
    TASKS: 'tasks',
    USER_PROGRESS: 'userProgress',
    SCHEDULES: 'schedules'
  };

  // Task operations
  async getTasks(filters?: { completed?: boolean; category?: string; dueDate?: Date }): Promise<Task[]> {
    try {
      let tasksQuery = query(collection(db, this.COLLECTIONS.TASKS), orderBy('dueDate'));
      
      if (filters?.completed !== undefined) {
        tasksQuery = query(tasksQuery, where('completed', '==', filters.completed));
      }
      
      if (filters?.category) {
        tasksQuery = query(tasksQuery, where('category', '==', filters.category));
      }

      const querySnapshot = await getDocs(tasksQuery);
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id as any, // Firestore uses string IDs
          title: data.title,
          description: data.description || null,
          estimatedTime: data.estimatedTime,
          difficulty: data.difficulty,
          mood: data.mood,
          scheduleType: data.scheduleType,
          completed: data.completed,
          dueDate: data.dueDate?.toDate() || new Date(),
          category: data.category || null,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      // Apply date filter client-side if needed
      if (filters?.dueDate) {
        const filterDate = filters.dueDate.toDateString();
        return tasks.filter(task => task.dueDate.toDateString() === filterDate);
      }

      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async getTask(id: number): Promise<Task | undefined> {
    try {
      const docRef = doc(db, this.COLLECTIONS.TASKS, id.toString());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id as any,
          title: data.title,
          description: data.description || null,
          estimatedTime: data.estimatedTime,
          difficulty: data.difficulty,
          mood: data.mood,
          scheduleType: data.scheduleType,
          completed: data.completed,
          dueDate: data.dueDate?.toDate() || new Date(),
          category: data.category || null,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching task:', error);
      return undefined;
    }
  }

  async createTask(task: InsertTask): Promise<Task> {
    try {
      const taskData = {
        title: task.title,
        description: task.description || null,
        estimatedTime: task.estimatedTime,
        difficulty: task.difficulty,
        mood: task.mood,
        scheduleType: task.scheduleType,
        completed: false,
        dueDate: Timestamp.fromDate(task.dueDate),
        category: task.category || 'General',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTIONS.TASKS), taskData);
      
      return {
        id: docRef.id as any,
        title: task.title,
        description: task.description || null,
        estimatedTime: task.estimatedTime,
        difficulty: task.difficulty,
        mood: task.mood,
        scheduleType: task.scheduleType,
        completed: false,
        dueDate: task.dueDate,
        category: task.category || 'General',
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    try {
      const docRef = doc(db, this.COLLECTIONS.TASKS, id.toString());
      const updateData: any = { ...updates };
      
      if (updateData.dueDate) {
        updateData.dueDate = Timestamp.fromDate(updateData.dueDate);
      }
      
      await updateDoc(docRef, updateData);
      
      // Update user progress if task completed
      if (updates.completed && !updates.completed) {
        const task = await this.getTask(id);
        if (task) {
          await this.updateTaskCompletion(task);
        }
      }
      
      return await this.getTask(id);
    } catch (error) {
      console.error('Error updating task:', error);
      return undefined;
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      const docRef = doc(db, this.COLLECTIONS.TASKS, id.toString());
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // User progress operations
  async getUserProgress(): Promise<UserProgress> {
    try {
      const progressQuery = query(collection(db, this.COLLECTIONS.USER_PROGRESS));
      const querySnapshot = await getDocs(progressQuery);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id as any,
          xp: data.xp || 0,
          level: data.level || 1,
          streak: data.streak || 0,
          totalStudyTime: data.totalStudyTime || 0,
          completedTasks: data.completedTasks || 0,
          badges: data.badges || [],
          lastActivityDate: data.lastActivityDate?.toDate() || null,
        };
      }
      
      // Create default progress if none exists
      const defaultProgress = {
        xp: 0,
        level: 1,
        streak: 0,
        totalStudyTime: 0,
        completedTasks: 0,
        badges: [],
        lastActivityDate: null,
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTIONS.USER_PROGRESS), defaultProgress);
      return { id: docRef.id as any, ...defaultProgress };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return {
        id: 'default' as any,
        xp: 0,
        level: 1,
        streak: 0,
        totalStudyTime: 0,
        completedTasks: 0,
        badges: [],
        lastActivityDate: null,
      };
    }
  }

  async updateUserProgress(updates: Partial<UserProgress>): Promise<UserProgress> {
    try {
      const progressQuery = query(collection(db, this.COLLECTIONS.USER_PROGRESS));
      const querySnapshot = await getDocs(progressQuery);
      
      let docId: string;
      
      if (!querySnapshot.empty) {
        docId = querySnapshot.docs[0].id;
      } else {
        // Create new progress document
        const newProgress = await this.getUserProgress();
        docId = newProgress.id.toString();
      }
      
      const docRef = doc(db, this.COLLECTIONS.USER_PROGRESS, docId);
      const updateData: any = { ...updates };
      
      if (updateData.lastActivityDate) {
        updateData.lastActivityDate = Timestamp.fromDate(updateData.lastActivityDate);
      }
      
      await updateDoc(docRef, updateData);
      return await this.getUserProgress();
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  // Schedule operations
  async getSchedules(): Promise<Schedule[]> {
    try {
      const schedulesQuery = query(
        collection(db, this.COLLECTIONS.SCHEDULES), 
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(schedulesQuery);
      const schedules: Schedule[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        schedules.push({
          id: doc.id as any,
          title: data.title,
          scheduleData: data.scheduleData || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          isActive: data.isActive || false,
        });
      });
      
      return schedules;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return [];
    }
  }

  async getActiveSchedule(): Promise<Schedule | undefined> {
    try {
      const activeQuery = query(
        collection(db, this.COLLECTIONS.SCHEDULES),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(activeQuery);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id as any,
          title: data.title,
          scheduleData: data.scheduleData || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          isActive: data.isActive || false,
        };
      }
      
      return undefined;
    } catch (error) {
      console.error('Error fetching active schedule:', error);
      return undefined;
    }
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    try {
      // Deactivate previous schedules
      const activeSchedules = await this.getSchedules();
      for (const activeSchedule of activeSchedules) {
        if (activeSchedule.isActive) {
          const docRef = doc(db, this.COLLECTIONS.SCHEDULES, activeSchedule.id.toString());
          await updateDoc(docRef, { isActive: false });
        }
      }
      
      const scheduleData = {
        title: schedule.title,
        scheduleData: schedule.scheduleData,
        createdAt: serverTimestamp(),
        isActive: true,
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTIONS.SCHEDULES), scheduleData);
      
      return {
        id: docRef.id as any,
        title: schedule.title,
        scheduleData: schedule.scheduleData,
        createdAt: new Date(),
        isActive: true,
      };
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  async updateSchedule(id: number, updates: Partial<Schedule>): Promise<Schedule | undefined> {
    try {
      const docRef = doc(db, this.COLLECTIONS.SCHEDULES, id.toString());
      await updateDoc(docRef, updates);
      
      // Fetch and return updated schedule
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id as any,
          title: data.title,
          scheduleData: data.scheduleData || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          isActive: data.isActive || false,
        };
      }
      
      return undefined;
    } catch (error) {
      console.error('Error updating schedule:', error);
      return undefined;
    }
  }

  // Analytics
  async getTaskStats(): Promise<TaskStats> {
    try {
      const tasks = await this.getTasks();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayTasks = tasks.filter(task => 
        task.dueDate >= today && task.dueDate < tomorrow
      );

      const completedToday = todayTasks.filter(task => task.completed);
      const studyTimeToday = completedToday.reduce((total, task) => total + task.estimatedTime, 0);
      
      const progress = await this.getUserProgress();

      return {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.completed).length,
        streak: progress.streak,
        studyTimeToday: Math.round(studyTimeToday / 60 * 10) / 10, // Convert to hours with 1 decimal
      };
    } catch (error) {
      console.error('Error fetching task stats:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        streak: 0,
        studyTimeToday: 0,
      };
    }
  }

  // Helper method for task completion
  private async updateTaskCompletion(task: Task): Promise<void> {
    try {
      const progress = await this.getUserProgress();
      
      // Calculate XP based on difficulty and mood
      let baseXP = 10;
      const difficultyMultiplier = { Easy: 1, Medium: 1.5, Hard: 2 };
      const moodMultiplier = { Excited: 1.2, Neutral: 1, Stressed: 0.8 };
      
      const xpGained = Math.round(
        baseXP * difficultyMultiplier[task.difficulty] * moodMultiplier[task.mood]
      );

      // Update progress
      const newXp = progress.xp + xpGained;
      const newCompletedTasks = progress.completedTasks + 1;
      const newTotalStudyTime = progress.totalStudyTime + task.estimatedTime;
      
      // Check for level up (every 500 XP)
      const newLevel = Math.floor(newXp / 500) + 1;
      const newBadges = [...progress.badges];
      
      if (newLevel > progress.level && !newBadges.includes("Level Up")) {
        newBadges.push("Level Up");
      }

      // Update streak
      const today = new Date();
      const lastActivity = progress.lastActivityDate;
      let newStreak = progress.streak;
      
      if (lastActivity) {
        const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Award badges
      if (newStreak >= 7 && !newBadges.includes("First Week")) {
        newBadges.push("First Week");
      }
      if (newTotalStudyTime >= 1500 && !newBadges.includes("Time Master")) {
        newBadges.push("Time Master");
      }

      await this.updateUserProgress({
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        totalStudyTime: newTotalStudyTime,
        completedTasks: newCompletedTasks,
        badges: newBadges,
        lastActivityDate: today,
      });
    } catch (error) {
      console.error('Error updating task completion:', error);
    }
  }
}