// FILE: client/src/components/PriceTrendChart45Day.tsx
// 45-DAY PRICE TREND CHART
// Shows price history: 30 days before + 15 days after the search date
// Uses real Amadeus production data only

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
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from "recharts";
import { Calendar, TrendingDown, TrendingUp, Loader2, X, Info } from "lucide-react";
import FlightCard from "./FlightCard";
import { format, parseISO, isToday, isTomorrow, differenceInDays } from "date-fns";

interface PriceDataPoint {
  date: string;
  price: number | null;
  flightData: any | null;
  status: 'success' | 'no_flights' | 'error';
  daysFromSearch: number;
}

interface PriceTrendChart45DayProps {
  origin: string;
  destination: string;
  departDate: string;  // The user's search date (reference point)
  passengers?: number;
  onDateSelect?: (date: string, flightData: any) => void;
}

export default function PriceTrendChart45Day({
  origin,
  destination,
  departDate,
  passengers = 1,
  onDateSelect
}: PriceTrendChart45DayProps) {
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedFlights, setSelectedFlights] = useState<any[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ AUTO-LOAD: Fetch 45-day price calendar when props change
  useEffect(() => {
    console.log('🔄 PriceTrendChart45Day effect triggered');
    console.log('   Origin:', origin);
    console.log('   Destination:', destination);
    console.log('   Depart Date:', departDate);
    console.log('   Passengers:', passengers);
    
    if (origin && destination && departDate) {
      console.log('✅ All required props present - fetching 45-day price calendar');
      fetchPriceCalendar();
    } else {
      console.log('❌ Missing required props');
    }
  }, [origin, destination, departDate, passengers]);

  // Fetch 45-day price calendar (30 days before + 15 days after search date)
  const fetchPriceCalendar = async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FETCHING 45-DAY PRICE CALENDAR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Route:', origin, '→', destination);
    console.log('Search Date:', departDate);
    console.log('Range: 30 days before + 15 days after');
    console.log('Passengers:', passengers);
    
    setLoading(true);
    setError(null);
    
    try {
      const url = '/api/flights/price-calendar-45day';
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

      console.log('✅ 45-day price calendar loaded:', data.priceData.length, 'days');
      console.log('   Valid prices:', data.meta.validDataPoints);
      console.log('   Date range:', data.meta.dateRange.start, 'to', data.meta.dateRange.end);
      
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
    const daysFromSearch = data.daysFromSearch || 0;
    
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <div className="font-medium mb-1">
          {format(date, 'EEE, MMM dd, yyyy')}
        </div>
        {isSearchDate && <span className="text-xs text-amber-600 font-semibold">🎯 Your Search Date</span>}
        {!isSearchDate && (
          <div className="text-xs text-muted-foreground">
            {daysFromSearch > 0 ? `+${daysFromSearch}` : daysFromSearch} days from search
          </div>
        )}
        {data.price !== null ? (
          <>
            <div className="text-2xl font-bold text-primary mt-1">
              ₹{data.price.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Click to see flights
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground mt-1">
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
    if (isTomorrow(date)) return 'Tmrw';
    if (dateStr === departDate) return format(date, 'MMM dd') + ' 🎯';
    return format(date, 'MMM dd');
  };

  // Filter valid price data for chart
  const validPriceData = priceData.filter(d => d.price !== null);

  // Prepare data for area chart (to show before/after search date differently)
  const chartData = validPriceData.map(d => ({
    ...d,
    isBeforeSearch: new Date(d.date) < new Date(departDate),
    isAfterSearch: new Date(d.date) > new Date(departDate),
    isSearchDate: d.date === departDate
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              45-Day Price Trend
            </h3>
            <p className="text-sm text-muted-foreground">
              {origin} → {destination} • 30 days before + 15 days after {format(parseISO(departDate), 'MMM dd')}
            </p>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <>
            <div className="flex items-center justify-between mt-6 mb-4">
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                ✓ Real-Time Data • Amadeus Production
              </Badge>
              <Badge variant="outline" className="text-xs">
                45 Days • 30 Before + 15 After
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Best Price</div>
                <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                  <TrendingDown className="h-5 w-5" />
                  ₹{stats.lowestPrice?.toLocaleString('en-IN')}
                </div>
                {stats.bestDate && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(parseISO(stats.bestDate), 'MMM dd')}
                    {stats.daysBeforeBestPrice !== null && (
                      <span className="ml-1 text-green-600">
                        ({stats.daysBeforeBestPrice < 0 ? `${Math.abs(stats.daysBeforeBestPrice)}d before` : `+${stats.daysBeforeBestPrice}d after`})
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Your Date</div>
                <div className="text-2xl font-bold text-amber-600 flex items-center gap-1">
                  ₹{stats.searchDatePrice?.toLocaleString('en-IN') || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(parseISO(departDate), 'MMM dd')}
                </div>
              </div>
              
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Avg Price</div>
                <div className="text-2xl font-bold">
                  ₹{stats.averagePrice?.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  45-day average
                </div>
              </div>
              
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Savings</div>
                <div className="text-2xl font-bold text-primary">
                  {stats.potentialSavings && stats.potentialSavings > 0 ? (
                    <>₹{stats.potentialSavings.toLocaleString('en-IN')}</>
                  ) : (
                    <>✓ Best</>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.potentialSavings && stats.potentialSavings > 0 
                    ? `${Math.round(stats.potentialSavings / (stats.searchDatePrice || 1) * 100)}% cheaper` 
                    : 'You have the best price'}
                </div>
              </div>
            </div>

            {/* Recommendation */}
            {stats.potentialSavings && stats.potentialSavings > 0 && stats.bestDate && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-green-900 dark:text-green-100">
                      💡 Save ₹{stats.potentialSavings.toLocaleString('en-IN')} by booking on {format(parseISO(stats.bestDate), 'MMM dd')}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Click the green dot on the chart to see flights for the best price date
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Analyzing 45 days of prices...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Fetching real data from Amadeus API (30 days before + 15 days after)
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
              <h4 className="font-semibold">Interactive Price Comparison</h4>
              <p className="text-xs text-muted-foreground">
                Click any point to see flights for that date
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
              <AreaChart data={validPriceData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                {/* Reference line at search date */}
                <ReferenceLine 
                  x={departDate} 
                  stroke="#f59e0b" 
                  strokeDasharray="3 3" 
                  label={{ value: 'Your Search', position: 'top', fill: '#f59e0b' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#colorPrice)"
                  dot={<CustomDot />}
                  activeDot={{ r: 8 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
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
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-muted-foreground">←</span>
              <span>30 days before</span>
              <span className="mx-2">|</span>
              <span>15 days after</span>
              <span className="text-muted-foreground">→</span>
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












