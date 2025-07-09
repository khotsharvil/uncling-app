
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-calm p-6">
      <Card className="w-full max-w-md p-8 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          This page doesn't exist
        </p>
        <Button 
          onClick={() => navigate("/")}
          className="bg-primary hover:bg-primary/90"
        >
          Return Home
        </Button>
      </Card>
    </div>
  );
};

export default NotFound;
