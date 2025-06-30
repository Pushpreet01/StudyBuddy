import ScheduleDisplay from "@/components/schedule-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Clock, Calendar, TrendingUp, Target } from "lucide-react";

export default function SchedulePage() {
  const { data: schedules = [] } = useQuery({
    queryKey: ["/api/schedules"],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: activeSchedule } = useQuery({
    queryKey: ["/api/schedules/active"],
  });

  // Calculate schedule metrics
  const totalSchedules = schedules.length;
  const pendingTasks = tasks.filter((task: any) => !task.completed).length;
  const totalStudyTime = activeSchedule?.scheduleData?.reduce((total: number, block: any) => {
    if (block.title !== "Break") {
      const [start, end] = block.timeBlock.split('-');
      const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
      const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
      return total + (endMinutes - startMinutes);
    }
    return total;
  }, 0) || 0;

  const studyHours = Math.round(totalStudyTime / 60 * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Study Schedule</h1>
        <p className="text-gray-600 mt-1">AI-generated optimal study schedules</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-study-teal bg-opacity-10 rounded-lg flex items-center justify-center">
                <Calendar className="text-study-teal h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalSchedules}</p>
                <p className="text-gray-600 text-sm">Total Schedules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-study-coral bg-opacity-10 rounded-lg flex items-center justify-center">
                <Target className="text-study-coral h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingTasks}</p>
                <p className="text-gray-600 text-sm">Pending Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-study-mauve bg-opacity-10 rounded-lg flex items-center justify-center">
                <Clock className="text-study-mauve h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{studyHours}h</p>
                <p className="text-gray-600 text-sm">Scheduled Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-study-purple bg-opacity-10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-study-purple h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {activeSchedule?.scheduleData?.length || 0}
                </p>
                <p className="text-gray-600 text-sm">Study Blocks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Schedule Display */}
        <div className="lg:col-span-2">
          <ScheduleDisplay />
        </div>

        {/* Schedule History & Tips */}
        <div className="space-y-6">
          {/* Recent Schedules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Recent Schedules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No schedules created yet.</p>
                  <p className="text-sm mt-2">Generate your first schedule!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.slice(0, 5).map((schedule: any) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{schedule.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(schedule.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        schedule.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {schedule.isActive ? 'Active' : 'Archived'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Study Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Study Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-study-coral rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Peak Hours</h4>
                    <p className="text-sm text-gray-600">Schedule difficult tasks during morning hours when focus is highest.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-study-mauve rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Regular Breaks</h4>
                    <p className="text-sm text-gray-600">Take 15-minute breaks between study sessions to maintain focus.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-study-purple rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Consistent Timing</h4>
                    <p className="text-sm text-gray-600">Stick to your schedule to build effective study habits.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-study-teal rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Review Progress</h4>
                    <p className="text-sm text-gray-600">Regularly update your tasks and generate new schedules as needed.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}