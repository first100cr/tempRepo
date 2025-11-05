import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, DollarSign, Clock, Sparkles } from "lucide-react";

interface SortBarProps {
  resultCount: number;
  activeSort: "cheapest" | "fastest" | "best" | "recommended";
  onSortChange: (sort: "cheapest" | "fastest" | "best" | "recommended") => void;
}

export default function SortBar({ resultCount, activeSort, onSortChange }: SortBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" data-testid="badge-result-count">
          {resultCount} flights found
        </Badge>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground mr-2">Sort by:</span>
        <Button
          variant={activeSort === "recommended" ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange("recommended")}
          data-testid="button-sort-recommended"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          AI Recommended
        </Button>
        <Button
          variant={activeSort === "cheapest" ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange("cheapest")}
          data-testid="button-sort-cheapest"
        >
          <DollarSign className="h-4 w-4 mr-1" />
          Cheapest
        </Button>
        <Button
          variant={activeSort === "fastest" ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange("fastest")}
          data-testid="button-sort-fastest"
        >
          <Clock className="h-4 w-4 mr-1" />
          Fastest
        </Button>
        <Button
          variant={activeSort === "best" ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange("best")}
          data-testid="button-sort-best"
        >
          <ArrowUpDown className="h-4 w-4 mr-1" />
          Best Value
        </Button>
      </div>
    </div>
  );
}
