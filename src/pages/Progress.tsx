import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const ProgressView = () => {
  const navigate = useNavigate();
  const userId = "7eb8f894-ca27-4c0d-87d4-c3a18bb6fedf"; // replace later with dynamic

  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [rescueSessions, setRescueSessions] = useState<any[]>([]);
  const [restNotes, setRestNotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: checkInsData, error: checkInsError } = await supabase
        .from("check_ins")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (checkInsError) {
        console.error("Error fetching check-ins:", checkInsError);
      } else {
        setCheckIns(checkInsData || []);
      }

      const { data: rescueData, error: rescueError } = await supabase
        .from("rescue_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (rescueError) {
        console.error("Error fetching rescue sessions:", rescueError);
      } else {
        setRescueSessions(rescueData || []);
      }

      const { data: restData, error: restError } = await supabase
        .from("rest_notes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (restError) {
        console.error("Error fetching rest notes:", restError);
      } else {
        setRestNotes(restData || []);
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
          <h1 className="text-xl font-semibold text-foreground">Your Progress</h1>
        </div>

        <div className="space-y-6">
          {/* Check-ins */}
          <Card className="p-4 bg-white/80 shadow-md">
            <h2 className="text-lg font-medium mb-2">Daily Check-Ins</h2>
            {checkIns.length === 0 && <p className="text-muted-foreground">No check-ins yet.</p>}
            {checkIns.map((checkIn) => (
              <p key={checkIn.id} className="text-sm">
                📅 {new Date(checkIn.created_at).toLocaleDateString()} — Mood: {checkIn.mood} — {checkIn.notes}
              </p>
            ))}
          </Card>

          {/* Rescue Sessions */}
          <Card className="p-4 bg-white/80 shadow-md">
            <h2 className="text-lg font-medium mb-2">Rescue Me Sessions</h2>
            {rescueSessions.length === 0 && <p className="text-muted-foreground">No rescue sessions yet.</p>}
            {rescueSessions.map((session) => (
              <p key={session.id} className="text-sm">
                📅 {new Date(session.created_at).toLocaleDateString()} — Feeling: {session.feeling} — Trigger: {session.trigger}
              </p>
            ))}
          </Card>

          {/* Before You Rest */}
          <Card className="p-4 bg-white/80 shadow-md">
            <h2 className="text-lg font-medium mb-2">Before You Rest Notes</h2>
            {restNotes.length === 0 && <p className="text-muted-foreground">No rest notes yet.</p>}
            {restNotes.map((note) => {
              const [whatHelpedLine, messageToSelfLine] = (note.note || "").split("\n");
              return (
                <div key={note.id} className="space-y-2 mb-4">
                  <p className="text-xs text-muted-foreground">
                    📅 {new Date(note.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Card className="p-3 flex items-start gap-2 bg-primary/10">
                      <span>🌱</span>
                      <p className="text-sm font-medium">
                        {whatHelpedLine?.replace("What helped: ", "") || "What helped: N/A"}
                      </p>
                    </Card>
                    <Card className="p-3 flex items-start gap-2 bg-green-100">
                      <span>💌</span>
                      <p className="text-sm font-medium">
                        {messageToSelfLine?.replace("Message to self: ", "") || "Message to self: N/A"}
                      </p>
                    </Card>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressView;