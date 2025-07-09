
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SplashScreenProps {
  onContinue: () => void;
}

const SplashScreen = ({ onContinue }: SplashScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-calm">
      <Card className="w-full max-w-md p-8 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 bg-primary rounded-full"></div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Uncling</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Calm your mind. Heal your patterns. Feel secure, at your pace.
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3 text-left">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-muted-foreground">
              A private space for daily reflection and emotional growth
            </p>
          </div>
          <div className="flex items-start gap-3 text-left">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-muted-foreground">
              Emergency support when you're feeling triggered
            </p>
          </div>
          <div className="flex items-start gap-3 text-left">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-muted-foreground">
              Personalized guidance based on your attachment style
            </p>
          </div>
        </div>

        <Button 
          onClick={onContinue}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-medium"
        >
          Begin Your Journey
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4">
          All your data stays private and secure on your device
        </p>
      </Card>
    </div>
  );
};

export default SplashScreen;
