import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Briefcase,
} from "lucide-react";
import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";

interface FlightCardProps {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  price: number;
  currency?: string;
  aircraft?: string;
  baggage?: string;
  cabinClass?: string;
  availableSeats?: number;
  isValidated?: boolean;
  bookingUrl?: string;
  prediction?: {
    trend: "up" | "down" | "stable";
    message: string;
  };
  isBestDeal?: boolean;
  onBook?: () => void;
}

// ✅ Convert PT6H30M to 6h 30m
const formatDuration = (duration: string) => {
  if (!duration) return "";
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";
  return `${hours} ${minutes}`.trim();
};

// ✅ Format date to "09 Nov"
const fmtDate = (dateString: string) => {
  try {
    const d = parseISO(dateString);
    return isValid(d) ? format(d, "dd MMM") : dateString;
  } catch {
    return dateString;
  }
};

// ✅ Format time as 24h "14:35"
const fmtTime = (dateString: string) => {
  try {
    const d = parseISO(dateString);
    return isValid(d) ? format(d, "HH:mm") : dateString;
  } catch {
    return dateString;
  }
};

export default function FlightCard(props: FlightCardProps) {
  const {
    airline,
    airlineLogo,
    flightNumber,
    origin,
    destination,
    departTime,
    arriveTime,
    duration,
    stops,
    price,
    currency = "INR",
    aircraft = "N/A",
    baggage = "15kg",
    cabinClass = "Economy",
    availableSeats = 9,
    isValidated = false,
    bookingUrl,
    prediction,
    isBestDeal = false,
    onBook,
  } = props;

  const [showDetails, setShowDetails] = useState(false);

  const handleBook = () => {
    if (onBook) onBook();
    else if (bookingUrl) window.open(bookingUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Card
      className={`p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
        isBestDeal ? "border-primary border-2" : ""
      }`}
    >
      {isBestDeal && (
        <Badge className="mb-4 bg-primary text-primary-foreground animate-pulse">
          Best Deal • Recommended
        </Badge>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Left Section */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            {airlineLogo ? (
              <img
                src={airlineLogo}
                alt={airline}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Plane className="h-5 w-5 text-primary" />
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg">{airline}</h3>
              <p className="text-sm text-muted-foreground">
                {flightNumber} • {aircraft}
              </p>
            </div>

            {isValidated && (
              <Badge variant="secondary" className="ml-auto bg-green-500/10 text-green-600">
                Verified
              </Badge>
            )}
          </div>

          {/* Times */}
          <div className="flex items-center gap-4">
            {/* Depart */}
            <div className="text-center">
              <p className="text-2xl font-bold">{fmtTime(departTime)}</p>
              <p className="text-sm text-muted-foreground">{origin}</p>
              <p className="text-xs text-muted-foreground">{fmtDate(departTime)}</p>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center gap-2 w-full">
                <div className="h-px bg-border flex-1" />
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="h-px bg-border flex-1" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDuration(duration)}
              </p>
              <Badge variant="secondary" className="mt-1">
                {stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}`}
              </Badge>
            </div>

            {/* Arrive */}
            <div className="text-center">
              <p className="text-2xl font-bold">{fmtTime(arriveTime)}</p>
              <p className="text-sm text-muted-foreground">{destination}</p>
              <p className="text-xs text-muted-foreground">{fmtDate(arriveTime)}</p>
            </div>
          </div>

          {prediction && (
            <Badge
              variant="secondary"
              className={`${
                prediction.trend === "down"
                  ? "bg-green-500/10 text-green-600"
                  : "bg-orange-500/10 text-orange-600"
              }`}
            >
              {prediction.message}
            </Badge>
          )}
        </div>

        {/* Right Section */}
        <div className="lg:text-right space-y-3 lg:min-w-[180px]">
          <p className="text-3xl font-bold">
            ₹ {price.toLocaleString("en-IN")}
          </p>
          <p className="text-sm text-muted-foreground">per person</p>

          <Button className="w-full" onClick={handleBook}>
            Book Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button variant="ghost" className="w-full" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Hide Details" : "View Details"}{" "}
            {showDetails ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-6 pt-6 border-t grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" /> Baggage: {baggage}
          </div>
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-muted-foreground" /> Aircraft: {aircraft}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" /> Class: {cabinClass}
          </div>
        </div>
      )}
    </Card>
  );
}
