import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CustomCalendarProps {
  onDateClick: (date: Date) => void;
}

export default function CustomCalendar({ onDateClick }: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Create calendar grid
  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < (firstDayWeekday === 0 ? 6 : firstDayWeekday - 1); i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setCurrentDate(newDate);
  };

  const getTasksForDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return tasks.filter((task: any) => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return date < todayDate;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Card className="shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div key={index} className="aspect-square p-1">
              {day && (
                <div
                  className={`w-full h-full flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors ${
                    isToday(day)
                      ? 'bg-study-teal text-white'
                      : isPastDate(day)
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (!isPastDate(day)) {
                      const clickedDate = new Date(currentYear, currentMonth, day);
                      onDateClick(clickedDate);
                    }
                  }}
                >
                  <span className={`text-sm ${isToday(day) ? 'font-medium' : ''}`}>
                    {day}
                  </span>
                  {getTasksForDate(day).length > 0 && (
                    <div className="flex space-x-1 mt-1">
                      {getTasksForDate(day).slice(0, 3).map((task: any, taskIndex: number) => (
                        <div
                          key={taskIndex}
                          className={`w-1 h-1 rounded-full ${
                            task.difficulty === 'Hard'
                              ? 'bg-study-coral'
                              : task.difficulty === 'Medium'
                              ? 'bg-study-mauve'
                              : 'bg-study-purple'
                          } ${isToday(day) ? 'bg-white' : ''}`}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
