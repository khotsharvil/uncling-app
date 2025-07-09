
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, RefreshCw, Bell, FileText } from "lucide-react";
import { useState } from "react";

const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const attachmentStyle = localStorage.getItem("attachmentStyle") || "secure";

  const getAttachmentDescription = (style: string) => {
    const descriptions = {
      anxious: "You tend to seek reassurance and worry about relationships. You're working on building self-soothing skills.",
      avoidant: "You value independence and often handle emotions internally. You're exploring emotional connection.",
      disorganized: "You experience mixed feelings about closeness. You're building trust and emotional regulation skills.",
      secure: "You're comfortable with intimacy and independence. You're continuing to grow in self-awareness."
    };
    return descriptions[style as keyof typeof descriptions] || descriptions.secure;
  };

  const handleRetakeQuiz = () => {
    localStorage.removeItem("attachmentStyle");
    navigate("/");
    window.location.reload();
  };

  const handleClearMemory = () => {
    if (confirm("Are you sure you want to clear all your data? This cannot be undone.")) {
      localStorage.clear();
      navigate("/");
      window.location.reload();
    }
  };

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
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        </div>

        <div className="space-y-4">
          {/* Attachment Style */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-2">
                  Attachment Style: {attachmentStyle.charAt(0).toUpperCase() + attachmentStyle.slice(1)}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {getAttachmentDescription(attachmentStyle)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetakeQuiz}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Daily Reminders</h3>
                  <p className="text-sm text-muted-foreground">
                    Gentle nudges to check in with yourself
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </Card>

          {/* Privacy */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-2">Privacy First</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    All your data stays on your device. We never store or share your personal information.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearMemory}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Clear All Data
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy Policy */}
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">
                  Learn more about how we protect your data
                </p>
              </div>
            </div>
          </Card>

          {/* App Info */}
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              Uncling v1.0.0
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Made with care for your healing journey
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
