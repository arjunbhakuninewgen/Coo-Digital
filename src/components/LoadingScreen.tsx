
import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
      <h2 className="text-2xl font-medium text-muted-foreground">Loading...</h2>
    </div>
  );
};

export default LoadingScreen;
