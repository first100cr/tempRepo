// FILE: client/src/components/PriceTrendChartInteractive.tsx
// 15-DAY FORWARD PRICE CALENDAR
// Shows lowest price for next 15 days starting from selected departure date

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { Calendar, TrendingDown, TrendingUp, Loader2, X } from "lucide-react";
import FlightCard from "./FlightCard";
import { format, parseISO, addDays, isToday, isTomorrow } from "date-fns";

interface PriceDataPoint {
  date: string;
  price: number | null;
  flightData: any | null;
  status: 'success' | 'no_flights' | 'error';
}

interface PriceTrendChartInteractiveProps {
  origin: string;
  destination: string;
  departDate: string;  // Starting date for the 15-day calendar
  passengers?: number;
  onDateSelect?: (date: string, flightData: any) => void;
}

export default function PriceTrendChartInteractive({
  origin,
  destination,
  departDate,
  passengers = 1,
  onDateSelect
}: PriceTrendChartInteractiveProps) {
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedFlights, setSelectedFlights] = useState<any[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ AUTO-LOAD: Fetch 15-day price calendar when props change
  useEffect(() => {
    console.log('🔄 PriceTrendChart effect triggered');
    console.log('   Origin:', origin);
    console.log('   Destination:', destination);
    console.log('   Depart Date:', departDate);
    console.log('   Passengers:', passengers);
    
    if (origin && destination && departDate) {
      console.log('✅ All required props present - fetching price calendar');
      fetchPriceCalendar();
    } else {
      console.log('❌ Missing required props');
      if (!origin) console.log('   Missing: origin');
      if (!destination) console.log('   Missing: destination');
      if (!departDate) console.log('   Missing: departDate');
    }
  }, [origin, destination, departDate, passengers]);

  // Fetch 15-day price calendar
  const fetchPriceCalendar = async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FETCHING 15-DAY PRICE CALENDAR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Route:', origin, '→', destination);
    console.log('Starting Date:', departDate);
    console.log('Passengers:', passengers);
    
    setLoading(true);
    setError(null);
    
    try {
      const url = '/api/flights/price-calendar-15day';
      const payload = { origin, destination, departDate, passengers };
      
      console.log('📡 Calling API:', url);
      console.log('   Payload:', payload);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📨 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch price data');
      }

      console.log('✅ Price calendar loaded:', data.priceData.length, 'days');
      setPriceData(data.priceData);
      setStats(data.stats);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } catch (err: any) {
      console.error('❌ Price calendar error:', err);
      setError(err.message || 'Failed to load price calendar');
    } finally {
      setLoading(false);
    }
  };

  // Fetch flights for specific date when data point is clicked
  const handleDataPointClick = async (dataPoint: any) => {
    if (!dataPoint || !dataPoint.date) return;
    
    console.log('🖱️ Clicked date:', dataPoint.date, '- Price:', dataPoint.price);
    setSelectedDate(dataPoint.date);
    setLoadingFlights(true);
    
    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departDate: dataPoint.date,
          passengers,
          tripType: 'one-way'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch flights');
      }

      console.log('✅ Flights loaded:', data.data?.length || 0, 'flights');
      setSelectedFlights(data.data || []);
      onDateSelect?.(dataPoint.date, data.data?.[0]);
      
    } catch (err: any) {
      console.error('❌ Flight fetch error:', err);
      setSelectedFlights([]);
    } finally {
      setLoadingFlights(false);
    }
  };

  // Custom dot component for clickable data points
  const CustomDot = (props: any) => {
    const { cx, cy, payload, value } = props;
    
    if (value === null || value === undefined) return null;
    
    const isSelected = payload.date === selectedDate;
    const isLowest = stats && value === stats.lowestPrice;
    const isSearchDate = payload.date === departDate;
    
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 8 : isLowest ? 7 : isSearchDate ? 6 : 5}
          fill={isLowest ? "#10b981" : isSelected ? "#0ea5e9" : isSearchDate ? "#f59e0b" : "hsl(var(--primary))"}
          stroke={isSelected ? "#fff" : isSearchDate ? "#fff" : "none"}
          strokeWidth={isSelected || isSearchDate ? 2 : 0}
          style={{ cursor: 'pointer' }}
          onClick={() => handleDataPointClick(payload)}
        />
        {isLowest && (
          <text
            x={cx}
            y={cy - 15}
            textAnchor="middle"
            fill="#10b981"
            fontSize="11"
            fontWeight="bold"
          >
            Best
          </text>
        )}
        {isSearchDate && !isLowest && (
          <text
            x={cx}
            y={cy - 15}
            textAnchor="middle"
            fill="#f59e0b"
            fontSize="11"
            fontWeight="bold"
          >
            Your Date
          </text>
        )}
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    const date = parseISO(data.date);
    const isSearchDate = data.date === departDate;
    
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <div className="font-medium mb-1">
          {format(date, 'EEE, MMM dd, yyyy')}
          {isSearchDate && <span className="ml-2 text-xs text-amber-600">(Your Search)</span>}
        </div>
        {data.price !== null ? (
          <>
            <div className="text-2xl font-bold text-primary">
              ₹{data.price.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Click to see flights
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            No flights available
          </div>
        )}
      </div>
    );
  };

  // Format date for X-axis
  const formatXAxis = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (dateStr === departDate) return format(date, 'MMM dd') + '*';
    return format(date, 'MMM dd');
  };

  // Filter valid price data for chart
  const validPriceData = priceData.filter(d => d.price !== null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              15-Day Price Calendar
            </h3>
            <p className="text-sm text-muted-foreground">
              {origin} → {destination} from {format(parseISO(departDate), 'MMM dd')} • Click any point to see flights
            </p>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <>
            <div className="flex items-center justify-between mt-6 mb-4">
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                ✓ Real-Time Data
              </Badge>
              <Badge variant="outline" className="text-xs">
                15 Days Forward
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Lowest Price</div>
                <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                  <TrendingDown className="h-5 w-5" />
                  ₹{stats.lowestPrice?.toLocaleString('en-IN')}
                </div>
                {stats.bestDate && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(parseISO(stats.bestDate), 'MMM dd')}
                    {stats.bestDate !== departDate && (
                      <span className="text-green-600 ml-1">
                        (Save ₹{(stats.searchDatePrice - stats.lowestPrice)?.toLocaleString('en-IN') || 0})
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Your Date Price</div>
                <div className="text-2xl font-bold text-amber-600 flex items-center gap-1">
                  ₹{stats.searchDatePrice?.toLocaleString('en-IN') || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(parseISO(departDate), 'MMM dd')}
                </div>
              </div>
              
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Average Price</div>
                <div className="text-2xl font-bold">
                  ₹{stats.averagePrice?.toLocaleString('en-IN')}
                </div>
              </div>
              
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Data Points</div>
                <div className="text-2xl font-bold">
                  {validPriceData.length}/15
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  days available
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Loading 15-day price calendar...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Checking prices for flexible dates
            </p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="p-6 border-red-500">
          <div className="flex items-center gap-3 text-red-600">
            <X className="h-5 w-5" />
            <div>
              <div className="font-medium">Failed to load price calendar</div>
              <div className="text-sm text-muted-foreground">{error}</div>
            </div>
          </div>
          <Button 
            onClick={fetchPriceCalendar} 
            variant="outline" 
            className="mt-4"
          >
            Try Again
          </Button>
        </Card>
      )}

      {/* Chart */}
      {!loading && validPriceData.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Price Comparison</h4>
              <p className="text-xs text-muted-foreground">
                Next 15 days starting from {format(parseISO(departDate), 'MMM dd')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Interactive
              </Badge>
              <Badge variant="default" className="text-xs bg-green-600">
                Real Data
              </Badge>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={validPriceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${value}`}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  domain={['dataMin - 500', 'dataMax + 500']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Best Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Your Search Date</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-500"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>Other Dates</span>
            </div>
          </div>
        </Card>
      )}

      {/* Selected Date Flights */}
      {selectedDate && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-lg">
                Flights on {format(parseISO(selectedDate), 'EEEE, MMMM dd, yyyy')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {selectedFlights.length} flight{selectedFlights.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedDate(null);
                setSelectedFlights([]);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {loadingFlights && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loadingFlights && selectedFlights.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No flights available for this date
            </div>
          )}

          {!loadingFlights && selectedFlights.length > 0 && (
            <div className="space-y-4">
              {selectedFlights.slice(0, 5).map((flight) => (
                <FlightCard
                  key={flight.id}
                  {...flight}
                  isBestDeal={flight.id === selectedFlights[0].id}
                />
              ))}
              
              {selectedFlights.length > 5 && (
                <div className="text-center">
                  <Button variant="outline">
                    View All {selectedFlights.length} Flights
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}