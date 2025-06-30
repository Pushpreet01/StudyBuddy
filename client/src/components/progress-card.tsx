import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Flame, Clock, Target } from "lucide-react";

export default function ProgressCard() {
  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
  });

  const badgeIcons: { [key: string]: any } = {
    "First Week": "🏅",
    "Level Up": "⭐",
    "Time Master": "⏰",
  };

  const getBadgeGradient = (index: number) => {
    const gradients = [
      "from-study-cream to-study-coral",
      "from-study-mauve to-study-purple", 
      "from-study-purple to-study-teal",
    ];
    return gradients[index % gradients.length];
  };

  if (!progress) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Loading progress...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const xpProgress = ((progress.xp % 500) / 500) * 100;
  const nextLevelXp = Math.ceil(progress.xp / 500) * 500;

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Level Display */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-study-coral to-study-mauve rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-white h-8 w-8" />
          </div>
          <h4 className="text-xl font-bold text-gray-800">Level {progress.level}</h4>
          <p className="text-gray-600">{progress.xp.toLocaleString()} XP</p>
        </div>
        
        {/* Progress Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Daily Streak</span>
            <div className="flex items-center space-x-2">
              <Flame className="text-orange-500 h-4 w-4" />
              <span className="font-semibold text-gray-800">{progress.streak} days</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tasks Completed</span>
            <div className="flex items-center space-x-2">
              <Target className="text-green-500 h-4 w-4" />
              <span className="font-semibold text-gray-800">{progress.completedTasks}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Study Time</span>
            <div className="flex items-center space-x-2">
              <Clock className="text-blue-500 h-4 w-4" />
              <span className="font-semibold text-gray-800">
                {(progress.totalStudyTime / 60).toFixed(1)}h
              </span>
            </div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Next Level</span>
            <span>{progress.xp} / {nextLevelXp} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-study-coral to-study-mauve h-2 rounded-full transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Recent Badges */}
        <div className="mt-6">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Recent Badges</h5>
          <div className="grid grid-cols-3 gap-2">
            {progress.badges.slice(0, 3).map((badge: string, index: number) => (
              <div
                key={badge}
                className={`bg-gradient-to-br ${getBadgeGradient(index)} p-3 rounded-lg text-center`}
              >
                <div className="text-white text-lg mb-1">
                  {badgeIcons[badge] || "🏆"}
                </div>
                <p className="text-xs text-white font-medium">{badge}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
