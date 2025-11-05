import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FlightCard from "@/components/FlightCard";
import { Sparkles, Clock, TrendingDown, Percent } from "lucide-react";

export default function Deals() {
  const topDeals = [
    {
      id: "deal-1",
      airline: "Air India",
      flightNumber: "AI 860",
      origin: "DEL",
      destination: "BOM",
      departTime: "06:00",
      arriveTime: "08:15",
      duration: "2h 15m",
      stops: 0,
      price: 3200,
      aircraft: "Boeing 737",
      prediction: {
        trend: "down" as const,
        message: "Flash Deal - 40% Off"
      },
      isBestDeal: true
    },
    {
      id: "deal-2",
      airline: "IndiGo",
      flightNumber: "6E 2134",
      origin: "BLR",
      destination: "HYD",
      departTime: "10:30",
      arriveTime: "11:45",
      duration: "1h 15m",
      stops: 0,
      price: 2800,
      aircraft: "Airbus A320",
      prediction: {
        trend: "down" as const,
        message: "Limited Time - 35% Off"
      }
    },
    {
      id: "deal-3",
      airline: "Vistara",
      flightNumber: "UK 993",
      origin: "DEL",
      destination: "GOI",
      departTime: "14:15",
      arriveTime: "17:30",
      duration: "3h 15m",
      stops: 0,
      price: 4500,
      aircraft: "Airbus A320neo",
      prediction: {
        trend: "down" as const,
        message: "Weekend Special - 30% Off"
      }
    }
  ];

  const dealCategories = [
    { icon: Clock, title: "Last Minute Deals", count: 15, color: "text-orange-500" },
    { icon: TrendingDown, title: "Price Drops", count: 23, color: "text-green-500" },
    { icon: Percent, title: "Seasonal Offers", count: 12, color: "text-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent" data-testid="text-deals-title">
              Best Flight Deals
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover amazing discounts and limited-time offers on flights across India
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {dealCategories.map((category, idx) => (
            <Card key={idx} className="p-6 hover-elevate transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center ${category.color}`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold" data-testid={`text-category-${idx}`}>{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} active deals</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-display">Top Deals Today</h2>
            <Badge className="bg-primary text-primary-foreground animate-pulse" data-testid="badge-live-deals">
              🔥 Live Now
            </Badge>
          </div>
          <div className="space-y-4">
            {topDeals.map((deal) => (
              <FlightCard key={deal.id} {...deal} />
            ))}
          </div>
        </div>

        <Card className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold font-display">Never Miss a Deal</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get instant notifications when prices drop on your favorite routes
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90" data-testid="button-setup-alerts">
              <Sparkles className="mr-2 h-5 w-5" />
              Set Up Price Alerts
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
