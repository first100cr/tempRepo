import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PriceTuple = [number, number];

interface FilterPanelProps {
  onFilterChange?: (filters: {
    priceRange: PriceTuple;
    stops: string[];
    airlines: string[];
  }) => void;

  /** dynamic values coming from results */
  minPrice?: number;          // default 0
  maxPrice?: number;          // default 200000
  airlineOptions?: string[];  // default to common list
  stopOptions?: string[];     // default to ["Non-stop","1 stop","2+ stops"]
}

export default function FilterPanel({
  onFilterChange,
  minPrice = 0,
  maxPrice = 200000,
  airlineOptions,
  stopOptions = ["Non-stop", "1 stop", "2+ stops"],
}: FilterPanelProps) {
  const airlines = useMemo(
    () =>
      (airlineOptions && airlineOptions.length > 0)
        ? airlineOptions
        : ["Air India", "IndiGo", "SpiceJet", "Vistara", "Akasa Air", "AirAsia India"],
    [airlineOptions]
  );

  // ensure slider always spans the whole price domain for current results
  const [priceRange, setPriceRange] = useState<PriceTuple>([
    Math.max(0, Math.floor(minPrice)),
    Math.max(Math.floor(minPrice), Math.ceil(maxPrice)),
  ]);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);

  // when new results arrive, reset the slider range to the new domain
  useEffect(() => {
    const nextRange: PriceTuple = [
      Math.max(0, Math.floor(minPrice)),
      Math.max(Math.floor(minPrice), Math.ceil(maxPrice)),
    ];
    setPriceRange(nextRange);
    // also emit change so the parent can re-apply with fresh bounds
    onFilterChange?.({ priceRange: nextRange, stops: selectedStops, airlines: selectedAirlines });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice]);

  const emit = (next: { priceRange?: PriceTuple; stops?: string[]; airlines?: string[] }) => {
    const payload = {
      priceRange: next.priceRange ?? priceRange,
      stops: next.stops ?? selectedStops,
      airlines: next.airlines ?? selectedAirlines,
    };
    onFilterChange?.(payload);
  };

  const handleStopToggle = (stop: string) => {
    const updated = selectedStops.includes(stop)
      ? selectedStops.filter(s => s !== stop)
      : [...selectedStops, stop];
    setSelectedStops(updated);
    emit({ stops: updated });
  };

  const handleAirlineToggle = (airline: string) => {
    const updated = selectedAirlines.includes(airline)
      ? selectedAirlines.filter(a => a !== airline)
      : [...selectedAirlines, airline];
    setSelectedAirlines(updated);
    emit({ airlines: updated });
  };

  const handlePriceChange = (value: number[]) => {
    const range: PriceTuple = [value[0], value[1]];
    setPriceRange(range);
    emit({ priceRange: range });
  };

  const clearFilters = () => {
    const resetRange: PriceTuple = [
      Math.max(0, Math.floor(minPrice)),
      Math.max(Math.floor(minPrice), Math.ceil(maxPrice)),
    ];
    setPriceRange(resetRange);
    setSelectedStops([]);
    setSelectedAirlines([]);
    onFilterChange?.({ priceRange: resetRange, stops: [], airlines: [] });
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
              min={Math.max(0, Math.floor(minPrice))}
              max={Math.max(Math.floor(minPrice), Math.ceil(maxPrice))}
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
