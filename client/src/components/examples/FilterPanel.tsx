import FilterPanel from '../FilterPanel';

export default function FilterPanelExample() {
  return (
    <div className="p-8 bg-background">
      <div className="max-w-sm">
        <FilterPanel onFilterChange={(filters) => console.log('Filters:', filters)} />
      </div>
    </div>
  );
}
