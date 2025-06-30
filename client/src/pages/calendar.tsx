import { useState } from "react";
import CustomCalendar from "@/components/custom-calendar";
import TaskModal from "@/components/task-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Target } from "lucide-react";

export default function CalendarPage() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Get upcoming tasks (next 7 days)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingTasks = tasks.filter((task: any) => {
    const taskDate = new Date(task.dueDate);
    return taskDate >= today && taskDate <= nextWeek && !task.completed;
  }).sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-1">View and manage your study schedule</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-study-coral bg-opacity-10 rounded-lg flex items-center justify-center">
                <Calendar className="text-study-coral h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                <p className="text-gray-600 text-sm">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-study-mauve bg-opacity-10 rounded-lg flex items-center justify-center">
                <Target className="text-study-mauve h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingTasks.length}</p>
                <p className="text-gray-600 text-sm">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-study-teal bg-opacity-10 rounded-lg flex items-center justify-center">
                <Clock className="text-study-teal h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.studyTimeToday || 0}h</p>
                <p className="text-gray-600 text-sm">Today's Study</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <CustomCalendar onDateClick={handleDateClick} />
        </div>

        {/* Upcoming Tasks */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming tasks this week.</p>
                  <p className="text-sm mt-2">Click on a date to add a task!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingTasks.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        task.difficulty === 'Hard' ? 'bg-study-coral' :
                        task.difficulty === 'Medium' ? 'bg-study-mauve' :
                        'bg-study-purple'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(task.dueDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {Math.floor(task.estimatedTime / 60)}h {task.estimatedTime % 60}m
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            task.difficulty === 'Hard' ? 'bg-study-coral bg-opacity-10 text-study-coral' :
                            task.difficulty === 'Medium' ? 'bg-study-mauve bg-opacity-10 text-study-mauve' :
                            'bg-study-purple bg-opacity-10 text-study-purple'
                          }`}>
                            {task.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {upcomingTasks.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{upcomingTasks.length - 5} more tasks this week
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedDate(null);
        }}
        selectedDate={selectedDate}
      />
    </div>
  );
}