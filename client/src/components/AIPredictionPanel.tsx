import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingDown, TrendingUp, Clock, Sparkles } from "lucide-react";

interface AIPredictionPanelProps {
  route: string;
  prediction: {
    recommendation: "book_now" | "wait" | "monitor";
    confidence: number;
    bestTimeToBook: string;
    expectedSavings?: number;
    priceDirection: "up" | "down" | "stable";
  };
}

export default function AIPredictionPanel({ route, prediction }: AIPredictionPanelProps) {
  const getRecommendationColor = () => {
    switch (prediction.recommendation) {
      case "book_now":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "wait":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    }
  };

  const getRecommendationText = () => {
    switch (prediction.recommendation) {
      case "book_now":
        return "Book Now - Best Price Window";
      case "wait":
        return "Wait - Prices Expected to Drop";
      default:
        return "Monitor - Prices Fluctuating";
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse shadow-lg shadow-primary/30">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold font-display text-lg" data-testid="text-ai-title">AI Price Prediction</h3>
            <p className="text-sm text-muted-foreground">{route}</p>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${getRecommendationColor()}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <p className="font-semibold" data-testid="text-recommendation">{getRecommendationText()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" data-testid="badge-confidence">
              {prediction.confidence}% Confidence
            </Badge>
            {prediction.expectedSavings && (
              <Badge variant="secondary" data-testid="badge-savings">
                Save ₹{prediction.expectedSavings}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Best Time to Book</p>
              <p className="text-sm text-muted-foreground" data-testid="text-best-time">{prediction.bestTimeToBook}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-card">
            {prediction.priceDirection === "down" ? (
              <TrendingDown className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <TrendingUp className="h-5 w-5 text-orange-500 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium">Price Trend</p>
              <p className="text-sm text-muted-foreground" data-testid="text-price-trend">
                {prediction.priceDirection === "down" ? "Decreasing" : prediction.priceDirection === "up" ? "Increasing" : "Stable"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
