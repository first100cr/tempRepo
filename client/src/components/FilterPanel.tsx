import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface FilterPanelProps {
  onFilterChange?: (filters: {
    priceRange: [number, number];
    stops: string[];
    airlines: string[];
  }) => void;
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);

  const airlines = ["Air India", "IndiGo", "SpiceJet", "Vistara", "Go First"];
  const stopOptions = ["Non-stop", "1 stop", "2+ stops"];

  const handleStopToggle = (stop: string) => {
    const updated = selectedStops.includes(stop)
      ? selectedStops.filter(s => s !== stop)
      : [...selectedStops, stop];
    setSelectedStops(updated);
    onFilterChange?.({ priceRange, stops: updated, airlines: selectedAirlines });
  };

  const handleAirlineToggle = (airline: string) => {
    const updated = selectedAirlines.includes(airline)
      ? selectedAirlines.filter(a => a !== airline)
      : [...selectedAirlines, airline];
    setSelectedAirlines(updated);
    onFilterChange?.({ priceRange, stops: selectedStops, airlines: updated });
  };

  const handlePriceChange = (value: number[]) => {
    const range: [number, number] = [value[0], value[1]];
    setPriceRange(range);
    onFilterChange?.({ priceRange: range, stops: selectedStops, airlines: selectedAirlines });
  };

  const clearFilters = () => {
    setPriceRange([0, 20000]);
    setSelectedStops([]);
    setSelectedAirlines([]);
    onFilterChange?.({ priceRange: [0, 20000], stops: [], airlines: [] });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h3 className="font-semibold font-display">Filters</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="font-medium">Price Range</Label>
          <div className="pt-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={20000}
              step={500}
              className="w-full"
              data-testid="slider-price-range"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span data-testid="text-min-price">₹{priceRange[0].toLocaleString()}</span>
            <span data-testid="text-max-price">₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Stops</Label>
          <div className="space-y-2">
            {stopOptions.map((stop) => (
              <div key={stop} className="flex items-center gap-2">
                <Checkbox
                  id={stop}
                  checked={selectedStops.includes(stop)}
                  onCheckedChange={() => handleStopToggle(stop)}
                  data-testid={`checkbox-stop-${stop.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <Label htmlFor={stop} className="font-normal cursor-pointer">
                  {stop}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Airlines</Label>
          <div className="space-y-2">
            {airlines.map((airline) => (
              <div key={airline} className="flex items-center gap-2">
                <Checkbox
                  id={airline}
                  checked={selectedAirlines.includes(airline)}
                  onCheckedChange={() => handleAirlineToggle(airline)}
                  data-testid={`checkbox-airline-${airline.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <Label htmlFor={airline} className="font-normal cursor-pointer">
                  {airline}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
