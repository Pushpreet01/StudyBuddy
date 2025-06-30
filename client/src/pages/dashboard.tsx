import { useState } from "react";
import Sidebar from "@/components/sidebar";
import CustomCalendar from "@/components/custom-calendar";
import TaskList from "@/components/task-list";
import ProgressCard from "@/components/progress-card";
import ScheduleDisplay from "@/components/schedule-display";
import TaskModal from "@/components/task-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, ListTodo, CheckCircle, Flame, Clock } from "lucide-react";

export default function Dashboard() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
              <p className="text-gray-600 mt-1">Welcome back! Here's your study overview.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-study-teal focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              <Button
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-study-teal text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Task</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-study-coral bg-opacity-10 rounded-lg flex items-center justify-center">
                    <ListTodo className="text-study-coral h-6 w-6" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">+12%</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{stats?.totalTasks || 0}</h3>
                <p className="text-gray-600 text-sm">Total ListTodo</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-study-mauve bg-opacity-10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-study-mauve h-6 w-6" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">+8%</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{stats?.completedTasks || 0}</h3>
                <p className="text-gray-600 text-sm">Completed</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-study-purple bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Flame className="text-study-purple h-6 w-6" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">+2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{stats?.streak || 0}</h3>
                <p className="text-gray-600 text-sm">Day Streak</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-study-teal bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Clock className="text-study-teal h-6 w-6" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">+45m</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{stats?.studyTimeToday || 0}h</h3>
                <p className="text-gray-600 text-sm">Today</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar and ListTodo Section */}
            <div className="lg:col-span-2 space-y-6">
              <CustomCalendar 
                onDateClick={(date) => {
                  setSelectedDate(date);
                  setIsTaskModalOpen(true);
                }}
              />
              <TaskList />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <ProgressCard />
              <ScheduleDisplay />
            </div>
          </div>
        </main>
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
