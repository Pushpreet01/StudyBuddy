import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Download, Sparkles, Loader2 } from "lucide-react";

export default function ScheduleDisplay() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeSchedule } = useQuery({
    queryKey: ["/api/schedules/active"],
  });

  const generateScheduleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/schedules/generate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules/active"] });
      toast({
        title: "Schedule generated!",
        description: "Your new AI-powered study schedule is ready.",
      });
      setIsGenerating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: "Using fallback schedule instead.",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleGenerateSchedule = () => {
    setIsGenerating(true);
    generateScheduleMutation.mutate();
  };

  const handleDownloadSchedule = () => {
    if (!activeSchedule) return;

    // Create a canvas to draw the schedule
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 800;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('Study Schedule', 50, 50);

    // Date
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(new Date().toLocaleDateString(), 50, 80);

    // Schedule blocks
    let yPos = 120;
    activeSchedule.scheduleData.forEach((block: any, index: number) => {
      // Time block background
      const colors = ['#F67280', '#C06C84', '#6C5B78', '#355C7D'];
      ctx.fillStyle = colors[index % colors.length];
      ctx.globalAlpha = 0.1;
      ctx.fillRect(40, yPos - 15, 520, 60);
      ctx.globalAlpha = 1;

      // Time
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(block.timeBlock, 50, yPos);

      // Title
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText(block.title, 150, yPos);

      // Description
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(block.description || '', 150, yPos + 20);

      // Difficulty indicator
      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.arc(520, yPos - 5, 5, 0, 2 * Math.PI);
      ctx.fill();

      yPos += 80;
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `study-schedule-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
      URL.revokeObjectURL(url);
    });

    toast({
      title: "Schedule downloaded!",
      description: "Your schedule has been saved as a PNG file.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Hard": return "bg-study-coral";
      case "Medium": return "bg-study-mauve";
      case "Easy": return "bg-study-purple";
      default: return "bg-gray-300";
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            AI Study Schedule
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadSchedule}
            disabled={!activeSchedule}
            className="text-study-teal hover:text-study-teal-dark"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {activeSchedule ? (
          <div className="space-y-3">
            {activeSchedule.scheduleData.map((block: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 w-20">
                  {block.timeBlock.split('-')[0]}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800">{block.title}</h5>
                  <p className="text-xs text-gray-600">{block.description}</p>
                </div>
                <div className={`w-3 h-3 ${getDifficultyColor(block.difficulty)} rounded-full`}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p className="mb-4">No active schedule found.</p>
            <p className="text-sm">Generate your first AI-powered schedule!</p>
          </div>
        )}
        
        <Button
          onClick={handleGenerateSchedule}
          disabled={isGenerating || generateScheduleMutation.isPending}
          className="w-full mt-4 bg-study-teal text-white hover:bg-study-teal/90 flex items-center justify-center space-x-2"
        >
          {isGenerating || generateScheduleMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span>
            {isGenerating || generateScheduleMutation.isPending 
              ? "Generating..." 
              : "Generate New Schedule"
            }
          </span>
        </Button>
      </CardContent>
    </Card>
  );
}
