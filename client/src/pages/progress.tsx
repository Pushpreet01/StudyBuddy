import ProgressCard from "@/components/progress-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Target, Flame, Clock, TrendingUp, Award } from "lucide-react";

export default function ProgressPage() {
  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  if (!progress) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-study-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Calculate weekly progress
  const weeklyTasks = tasks.filter((task: any) => {
    const taskDate = new Date(task.dueDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return taskDate >= weekAgo && task.completed;
  });

  const weeklyStudyTime = weeklyTasks.reduce((total: any, task: any) => total + task.estimatedTime, 0);
  const weeklyHours = Math.round(weeklyStudyTime / 60 * 10) / 10;

  // Badge data with descriptions
  const badgeDescriptions: { [key: string]: string } = {
    "First Week": "Complete tasks for 7 consecutive days",
    "Level Up": "Reach a new experience level",
    "Time Master": "Study for over 25 hours total",
  };

  const allPossibleBadges = ["First Week", "Level Up", "Time Master"];
  const earnedBadges = progress.badges || [];
  const unlockedBadges = allPossibleBadges.filter(badge => !earnedBadges.includes(badge));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Progress</h1>
        <p className="text-gray-600 mt-1">Track your learning journey and achievements</p>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-study-coral bg-opacity-10 rounded-lg flex items-center justify-center">
                <Trophy className="text-study-coral h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Level {progress.level}</p>
                <p className="text-gray-600 text-sm">{progress.xp.toLocaleString()} XP</p>
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
                <p className="text-2xl font-bold text-gray-900">{progress.completedTasks}</p>
                <p className="text-gray-600 text-sm">Tasks Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-study-purple bg-opacity-10 rounded-lg flex items-center justify-center">
                <Flame className="text-study-purple h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{progress.streak}</p>
                <p className="text-gray-600 text-sm">Day Streak</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {(progress.totalStudyTime / 60).toFixed(1)}h
                </p>
                <p className="text-gray-600 text-sm">Total Study Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Progress Card */}
        <div className="lg:col-span-2">
          <ProgressCard />
        </div>

        {/* Weekly Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tasks Completed</span>
                  <span className="font-semibold text-gray-900">{weeklyTasks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Study Time</span>
                  <span className="font-semibold text-gray-900">{weeklyHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold text-gray-900">{progress.streak} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Badges Earned</span>
                  <span className="font-semibold text-gray-900">{earnedBadges.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earned Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-study-coral" />
              Earned Badges ({earnedBadges.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {earnedBadges.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No badges earned yet.</p>
                <p className="text-sm mt-2">Complete tasks to earn your first badge!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {earnedBadges.map((badge: string, index: number) => {
                  const colors = [
                    "from-study-coral to-study-mauve",
                    "from-study-mauve to-study-purple", 
                    "from-study-purple to-study-teal",
                  ];
                  return (
                    <div key={badge} className={`bg-gradient-to-r ${colors[index % colors.length]} p-4 rounded-lg text-white`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{badge}</h3>
                          <p className="text-sm opacity-90">{badgeDescriptions[badge]}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals to Unlock */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-study-teal" />
              Goals to Unlock
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Next Level Progress */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">Next Level</span>
                  <span className="text-sm text-gray-600">Level {progress.level + 1}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-study-coral to-study-mauve h-2 rounded-full"
                    style={{ width: `${((progress.xp % 500) / 500) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {500 - (progress.xp % 500)} XP to level {progress.level + 1}
                </p>
              </div>

              {/* Unlockable Badges */}
              {unlockedBadges.map((badge: string) => (
                <div key={badge} className="p-4 border border-gray-200 rounded-lg opacity-60">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{badge}</h4>
                      <p className="text-sm text-gray-600">{badgeDescriptions[badge]}</p>
                    </div>
                  </div>
                </div>
              ))}

              {unlockedBadges.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>All badges unlocked!</p>
                  <p className="text-sm mt-2">You're a StudyBuddy master!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}