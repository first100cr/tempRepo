// client/src/components/PriceTrendChart45Day.tsx
// FIXED VERSION - Safe date parsing and null checks

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from "recharts";
import { Calendar, TrendingDown, Loader2, X, Info, Plane, Clock, ArrowRight, MapPin, Users, Luggage } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isValid } from "date-fns";

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
  departDate: string;
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
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (origin && destination && departDate) {
      fetchPriceCalendar();
    }
  }, [origin, destination, departDate, passengers]);

  const fetchPriceCalendar = async () => {
    console.log('Fetching 45-day price calendar...');
    
    setLoading(true);
    setError(null);
    setSelectedFlight(null);
    setSelectedDate(null);
    
    try {
      const url = '/api/flights/price-calendar-45day';
      const payload = { origin, destination, departDate, passengers };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch price data');
      }

      console.log('Price calendar loaded:', data.priceData?.length || 0, 'days');
      
      setPriceData(data.priceData || []);
      setStats(data.stats);
      
    } catch (err: any) {
      console.error('Price calendar error:', err);
      setError(err.message || 'Failed to load price calendar');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Safe date formatting with validation
  const formatFlightDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return 'Invalid date';
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) return dateStr;
      return format(date, 'EEEE, MMMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  // ✅ FIX: Safe short date formatting
  const formatShortDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return 'Invalid date';
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) return dateStr;
      return format(date, 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  // ✅ FIX: Safe date parsing helper
  const safeParseDepartDate = (): string => {
    if (!departDate) return '';
    try {
      const date = parseISO(departDate);
      if (!isValid(date)) return departDate;
      return format(date, 'MMM dd');
    } catch {
      return departDate;
    }
  };

  const handleDataPointClick = (data: any) => {
    console.log('Chart clicked:', data);
    
    if (!data || !data.activePayload || data.activePayload.length === 0) {
      return;
    }
    
    const clickedPoint = data.activePayload[0].payload;
    console.log('Clicked point:', clickedPoint);
    
    if (!clickedPoint.flightData) {
      console.log('No flight data for:', clickedPoint.date);
      return;
    }
    
    console.log('Setting selected flight:', clickedPoint.flightData);
    
    setSelectedFlight(clickedPoint.flightData);
    setSelectedDate(clickedPoint.date);
    onDateSelect?.(clickedPoint.date, clickedPoint.flightData);
    
    setTimeout(() => {
      const card = document.getElementById('selected-flight-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload, value } = props;
    
    if (value === null || value === undefined) return null;
    
    const isSelected = selectedFlight && selectedDate === payload.date;
    const isLowest = stats && value === stats.lowestPrice;
    const isSearchDate = payload.date === departDate;
    
    const handleClick = () => {
      console.log('Dot clicked:', payload.date, payload.price);
      if (payload.flightData) {
        setSelectedFlight(payload.flightData);
        setSelectedDate(payload.date);
        setTimeout(() => {
          document.getElementById('selected-flight-card')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
          });
        }, 100);
      }
    };
    
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 9 : isLowest ? 7 : isSearchDate ? 6 : 5}
          fill={isLowest ? "#10b981" : isSelected ? "#0ea5e9" : isSearchDate ? "#f59e0b" : "hsl(var(--primary))"}
          stroke={isSelected ? "#fff" : isSearchDate ? "#fff" : "none"}
          strokeWidth={isSelected || isSearchDate ? 2 : 0}
          style={{ cursor: 'pointer' }}
          onClick={handleClick}
        />
        {isLowest && (
          <text x={cx} y={cy - 15} textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
            Best
          </text>
        )}
        {isSearchDate && !isLowest && (
          <text x={cx} y={cy - 15} textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">
            Your Date
          </text>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    
    // ✅ FIX: Safe date parsing in tooltip
    let formattedDate = data.date;
    try {
      const date = parseISO(data.date);
      if (isValid(date)) {
        formattedDate = format(date, 'EEE, MMM dd, yyyy');
      }
    } catch {
      // Keep original if parsing fails
    }
    
    const isSearchDate = data.date === departDate;
    const daysFromSearch = data.daysFromSearch || 0;
    
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <div className="font-medium mb-1">{formattedDate}</div>
        {isSearchDate && <span className="text-xs text-amber-600 font-semibold">Your Search Date</span>}
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
            <div className="text-xs text-green-600 font-semibold mt-1">
              Click to book
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground mt-1">No flights</div>
        )}
      </div>
    );
  };

  // ✅ FIX: Safe X-axis formatter
  const formatXAxis = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) return dateStr;
      
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tmrw';
      if (dateStr === departDate) return format(date, 'MMM dd') + ' *';
      return format(date, 'MMM dd');
    } catch {
      return dateStr;
    }
  };

  const chartData = priceData;
  const validPriceData = priceData.filter(d => d.price !== null);

  const handleBookNow = () => {
    if (!selectedFlight || !selectedFlight.bookingUrl) return;
    window.open(selectedFlight.bookingUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              45-Day Price Trend
            </h3>
            <p className="text-sm text-muted-foreground">
              {origin} to {destination} • 30 days before + 15 days after {safeParseDepartDate()}
            </p>
          </div>
        </div>

        {stats && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                Real-Time Data
              </Badge>
              <Badge variant="outline" className="text-xs">
                3x Faster Loading
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
                    {formatShortDate(stats.bestDate)}
                    {stats.daysBeforeBestPrice !== null && (
                      <span className="ml-1 text-green-600">
                        ({stats.daysBeforeBestPrice < 0 ? `${Math.abs(stats.daysBeforeBestPrice)}d before` : `+${stats.daysBeforeBestPrice}d`})
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Your Date</div>
                <div className="text-2xl font-bold text-amber-600">
                  ₹{stats.searchDatePrice?.toLocaleString('en-IN') || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {safeParseDepartDate()}
                </div>
              </div>
              
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Avg Price</div>
                <div className="text-2xl font-bold">
                  ₹{stats.averagePrice?.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-muted-foreground mt-1">45-day avg</div>
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
                    ? `${Math.round(stats.potentialSavings / (stats.searchDatePrice || 1) * 100)}% off` 
                    : 'Best price'}
                </div>
              </div>
            </div>

            {stats.potentialSavings && stats.potentialSavings > 0 && stats.bestDate && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-green-900 dark:text-green-100">
                      Save ₹{stats.potentialSavings.toLocaleString('en-IN')} by booking on {formatShortDate(stats.bestDate)}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Click the green dot on the chart to book instantly
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {loading && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Analyzing 45 days of prices...</p>
            <p className="text-sm text-muted-foreground mt-2">This will take about 30 seconds</p>
          </div>
        </Card>
      )}

      {error && !loading && (
        <Card className="p-6 border-red-500">
          <div className="flex items-center gap-3 text-red-600">
            <X className="h-5 w-5" />
            <div>
              <div className="font-medium">Failed to load</div>
              <div className="text-sm text-muted-foreground">{error}</div>
            </div>
          </div>
          <Button onClick={fetchPriceCalendar} variant="outline" className="mt-4">
            Try Again
          </Button>
        </Card>
      )}

      {!loading && chartData.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Interactive Price Comparison</h4>
              <p className="text-xs text-muted-foreground">
                Click any point to book that flight • Showing {chartData.length} days
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-orange-500 text-white">
                Interactive
              </Badge>
              <Badge variant="default" className="text-xs bg-green-600">
                Real Data
              </Badge>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData}
                onClick={handleDataPointClick}
              >
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
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tickFormatter={(value) => `₹${value}`}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  domain={['dataMin - 500', 'dataMax + 500']}
                />
                <Tooltip content={<CustomTooltip />} />
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
                  activeDot={{ r: 8, onClick: handleDataPointClick }}
                  connectNulls={false}
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
              <span>Your Date</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-500"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span>Click any dot to book</span>
            </div>
          </div>
        </Card>
      )}

      {/* ✅ ENHANCED: Full flight details card */}
      {selectedFlight && selectedDate && (
        <Card id="selected-flight-card" className="p-6 border-2 border-primary shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                Selected Flight
              </h4>
              <p className="text-sm text-muted-foreground">
                {formatFlightDate(selectedDate)}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setSelectedFlight(null); setSelectedDate(null); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Airline Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedFlight.airlineLogo && (
                  <img 
                    src={selectedFlight.airlineLogo} 
                    alt={selectedFlight.airline || 'Airline'}
                    className="h-12 w-12 rounded-full"
                  />
                )}
                <div>
                  <div className="font-bold text-xl">{selectedFlight.airline || 'Unknown Airline'}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedFlight.flightNumber || 'N/A'} • {selectedFlight.aircraft || 'N/A'}
                  </div>
                </div>
              </div>
              {selectedFlight.stops === 0 && (
                <Badge className="bg-green-500/10 text-green-600 border-green-600">
                  Non-stop
                </Badge>
              )}
              {selectedFlight.stops === 1 && (
                <Badge variant="secondary" className="text-yellow-600">
                  1 stop
                </Badge>
              )}
              {selectedFlight.stops > 1 && (
                <Badge variant="secondary" className="text-orange-600">
                  {selectedFlight.stops} stops
                </Badge>
              )}
            </div>

            {/* Flight Times */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="text-3xl font-bold">{selectedFlight.departTime || 'N/A'}</div>
                <div className="text-sm text-muted-foreground mt-1">{selectedFlight.origin || origin}</div>
                <div className="text-xs text-muted-foreground">{formatShortDate(selectedDate)}</div>
              </div>
              
              <div className="flex-1 flex flex-col items-center px-4">
                <Clock className="h-5 w-5 text-muted-foreground mb-1" />
                <span className="text-sm font-medium">{selectedFlight.duration || 'N/A'}</span>
                <div className="w-full h-px bg-border mt-2"></div>
              </div>
              
              <div className="flex-1 text-right">
                <div className="text-3xl font-bold">{selectedFlight.arriveTime || 'N/A'}</div>
                <div className="text-sm text-muted-foreground mt-1">{selectedFlight.destination || destination}</div>
                {selectedFlight.arriveDate && selectedFlight.arriveDate !== selectedDate && (
                  <div className="text-xs text-muted-foreground">{formatShortDate(selectedFlight.arriveDate)}</div>
                )}
              </div>
            </div>

            {/* Flight Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedFlight.cabinClass && (
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">Class</div>
                    <div className="font-medium">{selectedFlight.cabinClass}</div>
                  </div>
                </div>
              )}
              
              {selectedFlight.availableSeats && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">Seats</div>
                    <div className="font-medium">{selectedFlight.availableSeats} available</div>
                  </div>
                </div>
              )}
              
              {selectedFlight.baggage && (
                <div className="flex items-start gap-2">
                  <Luggage className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">Baggage</div>
                    <div className="font-medium">{selectedFlight.baggage}</div>
                  </div>
                </div>
              )}
              
              {selectedFlight.stops !== undefined && (
                <div className="flex items-start gap-2">
                  <Plane className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">Stops</div>
                    <div className="font-medium">
                      {selectedFlight.stops === 0 ? 'Non-stop' : `${selectedFlight.stops} stop${selectedFlight.stops > 1 ? 's' : ''}`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price and Book Button */}
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Price</div>
                <div className="text-4xl font-bold text-primary">
                  ₹{selectedFlight.price?.toLocaleString('en-IN') || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  per person {passengers > 1 && selectedFlight.price && `× ${passengers} = ₹${(selectedFlight.price * passengers).toLocaleString('en-IN')}`}
                </div>
              </div>
              <Button 
                className="bg-green-600 hover:bg-green-700 h-14 px-8 text-lg" 
                size="lg"
                onClick={handleBookNow}
                disabled={!selectedFlight.bookingUrl}
              >
                Book Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Additional Info */}
            {selectedFlight.isRefundable !== undefined && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>
                  {selectedFlight.isRefundable ? 'Refundable fare' : 'Non-refundable fare'}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}