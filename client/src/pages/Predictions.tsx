import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AIPredictionPanel from "@/components/AIPredictionPanel";
import PriceTrendChart from "@/components/PriceTrendChart";
import { Brain, TrendingDown, Calendar, MapPin } from "lucide-react";

export default function Predictions() {
  const [origin, setOrigin] = useState("Delhi");
  const [destination, setDestination] = useState("Mumbai");

  const routes = [
    { from: "Delhi", to: "Mumbai", trend: "down", savings: 850 },
    { from: "Delhi", to: "Bangalore", trend: "up", savings: 0 },
    { from: "Mumbai", to: "Chennai", trend: "down", savings: 450 },
    { from: "Kolkata", to: "Pune", trend: "stable", savings: 0 },
  ];

  const priceData = [
    { date: 'Jan 1', price: 5200 },
    { date: 'Jan 5', price: 4800 },
    { date: 'Jan 10', price: 5500 },
    { date: 'Jan 15', price: 4900 },
    { date: 'Jan 20', price: 4500 },
    { date: 'Jan 25', price: 4700 },
    { date: 'Jan 30', price: 4400 },
  ];

  const predictedData = [
    { date: 'Feb 1', price: 4200 },
    { date: 'Feb 3', price: 4100 },
    { date: 'Feb 5', price: 4300 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent" data-testid="text-predictions-title">
              AI-Powered Flight Price Predictions
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get intelligent insights on when to book your flights for the best prices
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold font-display mb-6">Get Price Prediction</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="pred-origin">From</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pred-origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="pl-10"
                  data-testid="input-pred-origin"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pred-destination">To</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pred-destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10"
                  data-testid="input-pred-destination"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button className="w-full" data-testid="button-get-prediction">
                <Brain className="mr-2 h-4 w-4" />
                Get Prediction
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <AIPredictionPanel
            route={`${origin} → ${destination}`}
            prediction={{
              recommendation: "book_now",
              confidence: 87,
              bestTimeToBook: "Within next 48 hours",
              expectedSavings: 850,
              priceDirection: "down"
            }}
          />
          <PriceTrendChart 
            route={`${origin} → ${destination}`}
            data={priceData} 
            predictedData={predictedData}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-display">Popular Routes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {routes.map((route, idx) => (
              <Card key={idx} className="p-6 hover-elevate transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg" data-testid={`text-route-${idx}`}>
                      {route.from} → {route.to}
                    </h3>
                  </div>
                  {route.trend === "down" ? (
                    <TrendingDown className="h-6 w-6 text-green-500" />
                  ) : route.trend === "up" ? (
                    <Calendar className="h-6 w-6 text-orange-500" />
                  ) : (
                    <Calendar className="h-6 w-6 text-blue-500" />
                  )}
                </div>
                {route.savings > 0 && (
                  <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                    Potential savings: ₹{route.savings}
                  </div>
                )}
                <Button variant="outline" className="w-full" data-testid={`button-view-route-${idx}`}>
                  View Prediction
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
