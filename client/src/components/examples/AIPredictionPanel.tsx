import AIPredictionPanel from '../AIPredictionPanel';

export default function AIPredictionPanelExample() {
  return (
    <div className="p-8 bg-background">
      <AIPredictionPanel
        route="Delhi → Mumbai"
        prediction={{
          recommendation: "book_now",
          confidence: 87,
          bestTimeToBook: "Within next 48 hours",
          expectedSavings: 850,
          priceDirection: "down"
        }}
      />
    </div>
  );
}
