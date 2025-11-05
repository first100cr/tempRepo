import SortBar from '../SortBar';
import { useState } from 'react';

export default function SortBarExample() {
  const [activeSort, setActiveSort] = useState<"cheapest" | "fastest" | "best" | "recommended">("recommended");
  
  return (
    <div className="p-8 bg-background">
      <SortBar 
        resultCount={12} 
        activeSort={activeSort}
        onSortChange={setActiveSort}
      />
    </div>
  );
}
