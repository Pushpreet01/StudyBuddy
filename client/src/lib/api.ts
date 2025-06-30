import { apiRequest } from "./queryClient";

export interface CreateTaskData {
  title: string;
  description?: string;
  estimatedTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  mood: "Excited" | "Neutral" | "Stressed";
  scheduleType: "Daily" | "Weekly" | "Monthly";
  dueDate: string;
  category?: string;
}

export const taskApi = {
  getTasks: async (filters?: { completed?: boolean; category?: string; dueDate?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await apiRequest("GET", `/api/tasks?${params.toString()}`);
    return response.json();
  },

  createTask: async (taskData: CreateTaskData) => {
    const response = await apiRequest("POST", "/api/tasks", taskData);
    return response.json();
  },

  updateTask: async (id: number, updates: Partial<CreateTaskData>) => {
    const response = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
    return response.json();
  },

  deleteTask: async (id: number) => {
    await apiRequest("DELETE", `/api/tasks/${id}`);
  },
};

export const progressApi = {
  getProgress: async () => {
    const response = await apiRequest("GET", "/api/progress");
    return response.json();
  },

  getStats: async () => {
    const response = await apiRequest("GET", "/api/stats");
    return response.json();
  },
};

export const scheduleApi = {
  getSchedules: async () => {
    const response = await apiRequest("GET", "/api/schedules");
    return response.json();
  },

  getActiveSchedule: async () => {
    const response = await apiRequest("GET", "/api/schedules/active");
    return response.json();
  },

  generateSchedule: async () => {
    const response = await apiRequest("POST", "/api/schedules/generate");
    return response.json();
  },
};
