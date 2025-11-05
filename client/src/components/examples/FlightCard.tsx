import FlightCard from '../FlightCard';

export default function FlightCardExample() {
  return (
    <div className="p-8 bg-background space-y-4">
      <FlightCard
        id="1"
        airline="Air India"
        flightNumber="AI 860"
        origin="DEL"
        destination="BOM"
        departTime="06:00"
        arriveTime="08:15"
        duration="2h 15m"
        stops={0}
        price={4500}
        aircraft="Boeing 737"
        prediction={{
          trend: "down",
          message: "Price likely to drop 12% in next 3 days"
        }}
        isBestDeal={true}
      />
      <FlightCard
        id="2"
        airline="IndiGo"
        flightNumber="6E 2134"
        origin="DEL"
        destination="BOM"
        departTime="10:30"
        arriveTime="12:50"
        duration="2h 20m"
        stops={0}
        price={5200}
        aircraft="Airbus A320"
      />
    </div>
  );
}
