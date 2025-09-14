import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { generateGeminiProgressInsight } from "../lib/generateGeminiProgressInsight";

const ProgressView = () => {
  const navigate = useNavigate();
  const userId = "7eb8f894-ca27-4c0d-87d4-c3a18bb6fedf"; // replace later with dynamic

  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [restNotes, setRestNotes] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<string>("Generating...");
  const [avgMood, setAvgMood] = useState<number>(0);
  const [weeklyChange, setWeeklyChange] = useState<number>(0);
  const [highlights, setHighlights] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: checkInsData } = await supabase
        .from("check_ins")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      setCheckIns(checkInsData || []);

      const { data: restData } = await supabase
        .from("rest_notes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setRestNotes(restData || []);

      // calculate avg mood & weekly change
      if (checkInsData && checkInsData.length > 0) {
        const numericMoods = checkInsData.map((c) =>
          typeof c.mood === "number" ? c.mood : parseInt(c.mood) || 0
        );
        const avg = numericMoods.reduce((a, b) => a + b, 0) / numericMoods.length;
        setAvgMood(avg);

        // split by week
        const now = new Date();
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);

        const thisWeek = numericMoods.filter(
          (c, i) => new Date(checkInsData[i].created_at) >= lastWeek
        );
        const prevWeek = numericMoods.filter(
          (c, i) => new Date(checkInsData[i].created_at) < lastWeek
        );

        const thisWeekAvg =
          thisWeek.length > 0
            ? thisWeek.reduce((a, b) => a + b, 0) / thisWeek.length
            : 0;
        const prevWeekAvg =
          prevWeek.length > 0
            ? prevWeek.reduce((a, b) => a + b, 0) / prevWeek.length
            : 0;

        setWeeklyChange(thisWeekAvg - prevWeekAvg);
      }

      // highlights: pick 2 positive notes
      const positiveNotes = checkInsData
        ?.map((c) => c.notes)
        .filter((n) => n && n.toLowerCase().includes("good" || "grateful"))
        .slice(0, 2);
      const restHighlights = restData?.map((r) => r.notes).slice(0, 1);
      setHighlights([...(positiveNotes || []), ...(restHighlights || [])]);

      // prepare notes for AI
      const combinedNotes = [
        ...(checkInsData?.map((c) => c.notes) || []),
        ...(restData?.map((n) => n.notes) || []),
      ]
        .filter(Boolean)
        .join("\n");

      if (combinedNotes.length > 0) {
        const rawInsight = await generateGeminiProgressInsight(combinedNotes);
        // format into structured guidance
        setAiInsight(
          `🌟 **Strengths**\n- ${
            rawInsight.split(".")[0] || "You're showing resilience."
          }\n\n⚡ **Challenges**\n- ${
            rawInsight.split(".")[1] || "Some emotional dips are present."
          }\n\n🚀 **Next Steps**\n- ${
            rawInsight.split(".")[2] ||
            "Keep building on what helps you, and track small wins daily."
          }`
        );
      } else {
        setAiInsight("Not enough data yet to generate an insight.");
      }
    };

    fetchData();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-calm p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 pt-8 pb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">
            Your Progress
          </h1>
        </div>

        <div className="space-y-6">
          {/* Progress Overview */}
          <Card className="p-4 bg-white/80 shadow-md">
            <h2 className="text-lg font-medium mb-2">Mood Overview</h2>
            <p className="text-sm mb-1">
              Average Mood: <b>{avgMood.toFixed(1)}/10</b>
            </p>
            <Progress value={(avgMood / 10) * 100} className="h-3" />
            <p
              className={`text-xs mt-2 ${
                weeklyChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {weeklyChange >= 0
                ? `▲ Improved by ${weeklyChange.toFixed(1)} from last week`
                : `▼ Dropped by ${Math.abs(weeklyChange).toFixed(
                    1
                  )} from last week`}
            </p>
          </Card>

          {/* Mood Chart */}
          <Card className="p-4 bg-white/80 shadow-md">
            <h2 className="text-lg font-medium mb-4">Mood Over Time</h2>
            {checkIns.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={checkIns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="created_at"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString()
                    }
                  />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="mood" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">
                No mood data yet.
              </p>
            )}
          </Card>

          {/* Highlights */}
          <Card className="p-4 bg-white/80 shadow-md">
            <h2 className="text-lg font-medium mb-2">Highlights</h2>
            {highlights.length > 0 ? (
              <ul className="list-disc list-inside text-sm">
                {highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No highlights captured yet.
              </p>
            )}
          </Card>

          {/* AI Insight */}
          <Card className="p-4 bg-white/80 shadow-md">
            <h2 className="text-lg font-medium mb-2">AI Insight & Guidance</h2>
            <p className="text-sm whitespace-pre-line">{aiInsight}</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressView;
