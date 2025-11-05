import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface PriceTrendChartProps {
  route: string;
  data: Array<{
    date: string;
    price: number;
  }>;
  predictedData?: Array<{
    date: string;
    price: number;
  }>;
}

export default function PriceTrendChart({ route, data, predictedData = [] }: PriceTrendChartProps) {
  const allData = [...data, ...predictedData.map(d => ({ ...d, isPrediction: true }))];
  
  return (
    <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-lg transition-all duration-300">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold font-display bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent" data-testid="text-chart-title">Price Trend for {route}</h3>
          <p className="text-sm text-muted-foreground">30-day price history and 7-day forecast</p>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={allData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value: number) => [`₹${value}`, 'Price']}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#colorPrice)"
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
