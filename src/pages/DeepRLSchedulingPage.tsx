import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Train, ArrowLeftRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Train {
  train_id: string;
  train_number: string;
  sih_score: number;
  [key: string]: any;
}

const DeepRLSchedulingPage = () => {
  const [date, setDate] = useState("");
  const [scheduledTrains, setScheduledTrains] = useState<Train[]>([]);
  const [remainingTrains, setRemainingTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch schedule from backend RL API
  const fetchSchedule = async () => {
    if (!date) {
      toast({
        title: "Date Required",
        description: "Please select a date to generate the schedule.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching schedule for date:', date);
      const res = await fetch(`/api/rl-schedule?date=${date}`);
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch schedule (${res.status})`);
      }
      
      const data = await res.json();
      console.log('Schedule data received:', data);
      
      setScheduledTrains(data.scheduled_trains || []);
      setRemainingTrains(data.remaining_trains || []);
      
      toast({
        title: "Schedule Generated",
        description: `Successfully generated schedule for ${date}`,
      });
    } catch (err: any) {
      console.error('Schedule generation error:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to fetch schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Swap a train from remaining to scheduled
  const swapTrain = (from: Train, to: Train) => {
    setScheduledTrains((prev) =>
      prev.map((t) => (t.train_id === to.train_id ? from : t))
    );
    setRemainingTrains((prev) =>
      prev.map((t) => (t.train_id === from.train_id ? to : t))
    );
  };

  // Update schedule in backend
  const updateSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rl-schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, scheduled_trains: scheduledTrains }),
      });
      if (!res.ok) throw new Error("Failed to update schedule");
      toast({
        title: "Schedule Updated",
        description: "AI schedule has been updated successfully!",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Deep RL Train Scheduling
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Use AI-powered Deep Reinforcement Learning to generate and optimize train schedules
          </p>
        </div>

        {/* Date Selection Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Generate Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="date">Select Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={fetchSchedule}
                  disabled={loading || !date}
                  className="w-full md:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Train className="mr-2 h-4 w-4" />
                      Generate Schedule
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Display */}
        {(scheduledTrains.length > 0 || remainingTrains.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Scheduled Trains */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Train className="h-5 w-5 text-green-600" />
                    Scheduled Trains ({scheduledTrains.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scheduledTrains.map((train) => (
                    <div
                      key={train.train_id}
                      className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {train.train_number}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Score: {train.sih_score?.toFixed(2) || "N/A"}
                          </p>
                        </div>
                        <Select
                          onValueChange={(value) => {
                            const swapTrainObj = remainingTrains.find(
                              (t) => t.train_id === value
                            );
                            if (swapTrainObj) swapTrain(swapTrainObj, train);
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Swap with..." />
                          </SelectTrigger>
                          <SelectContent>
                            {remainingTrains.map((t) => (
                              <SelectItem key={t.train_id} value={t.train_id}>
                                {t.train_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Remaining Trains */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-slate-600" />
                  Remaining Trains ({remainingTrains.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {remainingTrains.map((train) => (
                    <div
                      key={train.train_id}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {train.train_number}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Score: {train.sih_score?.toFixed(2) || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Update Button */}
        {scheduledTrains.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={updateSchedule}
              disabled={loading}
              size="lg"
              className="px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update AI Schedule"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeepRLSchedulingPage;
