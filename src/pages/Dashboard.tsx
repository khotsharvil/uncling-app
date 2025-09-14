import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Shield, MessageCircle, TrendingUp, Settings, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [attachmentStyle, setAttachmentStyle] = useState("secure");
  const [streak, setStreak] = useState(0);

  // Fetch user info dynamically
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("users")
        .select("attachment_style, streak")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
      } else {
        setAttachmentStyle(data?.attachment_style || "secure");
        setStreak(data?.streak || 0);
      }
    };

    fetchUserData();
  }, [userId]);

  const getStyleMessage = (style: string) => {
    const messages = {
      anxious: "Remember: Your worth isn't determined by others' responses to you.",
      avoidant: "Today, consider one small way to connect authentically with someone.",
      disorganized: "You're learning to trust yourself. That's brave work.",
      secure: "You're building on a foundation of self-awareness and growth."
    };
    return messages[style as keyof typeof messages] || messages.secure;
  };

  return (
    <div className="min-h-screen bg-gradient-calm p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pt-8 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hello</h1>
            <p className="text-muted-foreground">{getStyleMessage(attachmentStyle)}</p>
            {streak > 0 && (
              <p className="text-sm text-primary font-medium mt-1">
                {streak} day streak 🌱
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Actions */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className="p-6 card-hover cursor-pointer bg-white/80 backdrop-blur-sm border-0 shadow-md"
              onClick={() => navigate("/check-in")}
            >
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Check In Now</h3>
                <p className="text-xs text-muted-foreground">Daily moment of reflection</p>
              </div>
            </Card>

            <Card 
              className="p-6 card-hover cursor-pointer bg-white/80 backdrop-blur-sm border-0 shadow-md"
              onClick={() => navigate("/rescue-me")}
            >
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-foreground">I'm Triggered</h3>
                <p className="text-xs text-muted-foreground">Calm yourself right now</p>
              </div>
            </Card>

            <Card 
              className="p-6 card-hover cursor-pointer bg-white/80 backdrop-blur-sm border-0 shadow-md"
              onClick={() => navigate("/secure-chat")}
            >
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground">Secure Self</h3>
                <p className="text-xs text-muted-foreground">Talk it through</p>
              </div>
            </Card>

            <Card 
              className="p-6 card-hover cursor-pointer bg-white/80 backdrop-blur-sm border-0 shadow-md"
              onClick={() => navigate("/before-you-rest")}
            >
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                  <Moon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-foreground">Before You Rest</h3>
                <p className="text-xs text-muted-foreground">Evening reflection</p>
              </div>
            </Card>
          </div>

          <Card 
            className="p-6 card-hover cursor-pointer bg-white/80 backdrop-blur-sm border-0 shadow-md"
            onClick={() => navigate("/progress")}
          >
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground">Progress</h3>
              <p className="text-xs text-muted-foreground">See your growth</p>
            </div>
          </Card>
        </div>

        {/* Today's Insight */}
        <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-sm">
          <h4 className="font-medium text-foreground mb-2">Today's Insight</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Healing happens in small moments of self-awareness. Notice your patterns without judgment.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
