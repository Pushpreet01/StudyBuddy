import { GraduationCap, Home, ListTodo, Calendar, Clock, TrendingUp, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [location] = useLocation();
  
  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/' },
    { id: 'tasks', icon: ListTodo, label: 'My Tasks', path: '/tasks' },
    { id: 'calendar', icon: Calendar, label: 'Calendar', path: '/calendar' },
    { id: 'schedule', icon: Clock, label: 'Schedule', path: '/schedule' },
    { id: 'progress', icon: TrendingUp, label: 'Progress', path: '/progress' }
  ];

  // Calculate today's tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayTasks = (tasks as any[]).filter(task => {
    const taskDate = new Date(task.dueDate);
    return taskDate >= today && taskDate < tomorrow && !task.completed;
  });

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-lg border border-gray-200"
      >
        {sidebarOpen ? (
          <X className="h-6 w-6 text-gray-600" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col transform transition-transform duration-300 ease-in-out z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-study-cream to-study-coral border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap className="text-study-purple h-6 w-6" />
            </div>
            <div className="text-lg font-bold text-gray-800">StudyBuddy</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-study-purple bg-opacity-10 text-study-purple border-r-2 border-study-purple'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-study-mauve'
                  }`}
                  onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after click
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Quick Stats */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Quick Stats</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Tasks Today</span>
              <span className="text-sm font-semibold text-study-coral">{todayTasks.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Study Streak</span>
              <span className="text-sm font-semibold text-study-mauve">
                {progress?.streak || 0} days
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Level</span>
              <span className="text-sm font-semibold text-study-purple">
                Level {progress?.level || 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}