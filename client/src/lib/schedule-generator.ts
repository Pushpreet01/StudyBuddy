export interface ScheduleBlock {
  timeBlock: string;
  title: string;
  description?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  priority: number;
  taskId?: number;
}

export function generateOptimalSchedule(tasks: any[]): ScheduleBlock[] {
  if (tasks.length === 0) return [];

  // Sort tasks by priority (difficulty and due date)
  const sortedTasks = [...tasks].sort((a, b) => {
    // Prioritize by difficulty first
    const difficultyWeight = { Hard: 3, Medium: 2, Easy: 1 };
    const aDifficulty = difficultyWeight[a.difficulty as keyof typeof difficultyWeight];
    const bDifficulty = difficultyWeight[b.difficulty as keyof typeof difficultyWeight];
    
    if (aDifficulty !== bDifficulty) {
      return bDifficulty - aDifficulty; // Higher difficulty first
    }
    
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const schedule: ScheduleBlock[] = [];
  let currentTime = 9 * 60; // Start at 9:00 AM (in minutes)
  const maxTime = 17 * 60; // End at 5:00 PM
  const breakDuration = 15; // 15-minute breaks

  sortedTasks.forEach((task, index) => {
    if (currentTime >= maxTime) return; // Don't schedule beyond 5 PM

    // Calculate time slots
    const taskDuration = Math.min(task.estimatedTime, 120); // Max 2 hours per session
    const endTime = currentTime + taskDuration;

    if (endTime > maxTime) return; // Skip if task would run too late

    // Format time
    const startHour = Math.floor(currentTime / 60);
    const startMin = currentTime % 60;
    const endHour = Math.floor(endTime / 60);
    const endMinute = endTime % 60;

    const timeBlock = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}-${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

    schedule.push({
      timeBlock,
      title: task.title,
      description: task.description || `${task.difficulty} level task`,
      difficulty: task.difficulty,
      priority: task.difficulty === 'Hard' ? 3 : task.difficulty === 'Medium' ? 2 : 1,
      taskId: task.id,
    });

    currentTime = endTime;

    // Add break if not the last task and there's time
    if (index < sortedTasks.length - 1 && currentTime + breakDuration < maxTime) {
      const breakEndTime = currentTime + breakDuration;
      const breakEndHour = Math.floor(breakEndTime / 60);
      const breakEndMin = breakEndTime % 60;

      schedule.push({
        timeBlock: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}-${breakEndHour.toString().padStart(2, '0')}:${breakEndMin.toString().padStart(2, '0')}`,
        title: "Break",
        description: "Rest and recharge",
        difficulty: "Easy",
        priority: 0,
      });

      currentTime = breakEndTime;
    }
  });

  return schedule;
}

export function calculateStudyEfficiency(tasks: any[], userProgress: any): number {
  if (tasks.length === 0) return 0;

  let totalEfficiency = 0;
  let taskCount = 0;

  tasks.forEach(task => {
    let efficiency = 1.0; // Base efficiency

    // Adjust based on difficulty preference
    if (task.difficulty === 'Hard' && userProgress.level >= 3) {
      efficiency += 0.2; // Bonus for tackling hard tasks at higher levels
    }

    // Adjust based on mood
    switch (task.mood) {
      case 'Excited':
        efficiency += 0.3;
        break;
      case 'Stressed':
        efficiency -= 0.2;
        break;
      default:
        break;
    }

    // Adjust based on streak
    if (userProgress.streak >= 7) {
      efficiency += 0.1; // Streak bonus
    }

    totalEfficiency += Math.max(0.1, Math.min(2.0, efficiency)); // Clamp between 0.1 and 2.0
    taskCount++;
  });

  return taskCount > 0 ? totalEfficiency / taskCount : 0;
}

export function suggestOptimalStudyTimes(tasks: any[]): string[] {
  const suggestions: string[] = [];

  // Analyze task patterns
  const hardTasks = tasks.filter(task => task.difficulty === 'Hard').length;
  const stressedTasks = tasks.filter(task => task.mood === 'Stressed').length;

  // Morning suggestions
  if (hardTasks > 0) {
    suggestions.push("Schedule challenging tasks in the morning when focus is highest");
  }

  // Break suggestions
  if (tasks.length > 3) {
    suggestions.push("Take 15-minute breaks between study sessions");
  }

  // Stress management
  if (stressedTasks > 0) {
    suggestions.push("Consider shorter study sessions for stressful topics");
  }

  // General tips
  suggestions.push("Stay hydrated and maintain good posture while studying");

  return suggestions;
}
