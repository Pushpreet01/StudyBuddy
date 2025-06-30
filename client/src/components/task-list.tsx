import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MoreHorizontal } from "lucide-react";

export default function TaskList() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const handleTaskToggle = (taskId: number, completed: boolean) => {
    updateTaskMutation.mutate({
      id: taskId,
      updates: { completed },
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Hard": return "bg-study-coral bg-opacity-10 text-study-coral";
      case "Medium": return "bg-study-mauve bg-opacity-10 text-study-mauve";
      case "Easy": return "bg-study-purple bg-opacity-10 text-study-purple";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "Excited": return "bg-study-mauve bg-opacity-10 text-study-mauve";
      case "Neutral": return "bg-study-teal bg-opacity-10 text-study-teal";
      case "Stressed": return "bg-study-cream bg-opacity-50 text-yellow-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const formatDueDate = (date: string) => {
    const dueDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dueDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return dueDate.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Loading tasks...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Get today's tasks
  const today = new Date();
  const todayTasks = tasks.filter((task: any) => {
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Today's Tasks ({todayTasks.length})
          </CardTitle>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {todayTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks scheduled for today.</p>
            <p className="text-sm mt-2">Click on a calendar date to add a new task!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayTasks.map((task: any) => (
              <div
                key={task.id}
                className={`flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => 
                      handleTaskToggle(task.id, checked as boolean)
                    }
                    className="data-[state=checked]:bg-study-teal data-[state=checked]:border-study-teal"
                  />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium text-gray-800 ${
                    task.completed ? 'line-through' : ''
                  }`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gray-500">
                      {formatTime(task.estimatedTime)}
                    </span>
                    <Badge className={getDifficultyColor(task.difficulty)}>
                      {task.difficulty}
                    </Badge>
                    <Badge className={getMoodColor(task.mood)}>
                      {task.mood}
                    </Badge>
                  </div>
                </div>
                <div className={`text-sm ${
                  task.completed ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {task.completed ? 'Completed' : formatDueDate(task.dueDate)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
