// client/src/pages/PriceTrendsPage.tsx
// Dedicated page for price trends and calendar view

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, TrendingDown, Calendar, Sparkles } from "lucide-react";
import PriceTrendChartInteractive from "@/components/PriceTrendChartInteractive";

export default function PriceTrendsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [origin, setOrigin] = useState(searchParams.get('origin') || 'DEL');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'BOM');
  const [passengers, setPassengers] = useState(parseInt(searchParams.get('passengers') || '1'));
  const [showChart, setShowChart] = useState(!!searchParams.get('origin'));

  const handleAnalyze = () => {
    setSearchParams({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      passengers: passengers.toString()
    });
    setShowChart(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Price Trends</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Analyze flight prices over 45 days and find the best time to book
          </p>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">From</Label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                  placeholder="DEL"
                  className="pl-10"
                  maxLength={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">To</Label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-90" />
                <Input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase())}
                  placeholder="BOM"
                  className="pl-10"
                  maxLength={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passengers">Passengers</Label>
              <Input
                id="passengers"
                type="number"
                min={1}
                max={9}
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label className="opacity-0">Action</Label>
              <Button 
                onClick={handleAnalyze} 
                className="w-full"
                size="lg"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Prices
              </Button>
            </div>
          </div>
        </Card>

        {/* Price Insights Cards */}
        {!showChart && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Best Price Detection</h3>
                  <p className="text-sm text-muted-foreground">
                    AI identifies the lowest prices across 45 days
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Interactive Calendar</h3>
                  <p className="text-sm text-muted-foreground">
                    Click any date to see available flights instantly
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Smart Predictions</h3>
                  <p className="text-sm text-muted-foreground">
                    7-day forecast helps you book at the right time
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Interactive Chart */}
        {showChart && (
          <PriceTrendChartInteractive
            origin={origin}
            destination={destination}
            passengers={passengers}
          />
        )}

        {/* How it Works */}
        {!showChart && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">How Price Trends Work</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Enter Your Route</h3>
                  <p className="text-muted-foreground">
                    Specify your departure and arrival airports to begin analysis
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">We Analyze 45 Days</h3>
                  <p className="text-muted-foreground">
                    Our system fetches real prices from Amadeus for the past 30 days and next 15 days
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Click Any Date</h3>
                  <p className="text-muted-foreground">
                    Interactive chart lets you click any price point to see available flights for that date
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Book Instantly</h3>
                  <p className="text-muted-foreground">
                    View flight details and book directly from the chart - all in one place
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}