import FlightSearchForm from '../FlightSearchForm';

export default function FlightSearchFormExample() {
  return (
    <div className="p-8 bg-background">
      <FlightSearchForm onSearch={(params) => console.log('Search:', params)} />
    </div>
  );
}
