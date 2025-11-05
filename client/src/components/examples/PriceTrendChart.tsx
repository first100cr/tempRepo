import PriceTrendChart from '../PriceTrendChart';

export default function PriceTrendChartExample() {
  const mockData = [
    { date: 'Jan 1', price: 5200 },
    { date: 'Jan 5', price: 4800 },
    { date: 'Jan 10', price: 5500 },
    { date: 'Jan 15', price: 4900 },
    { date: 'Jan 20', price: 4500 },
    { date: 'Jan 25', price: 4700 },
    { date: 'Jan 30', price: 4400 },
  ];

  const predictedData = [
    { date: 'Feb 1', price: 4200 },
    { date: 'Feb 3', price: 4100 },
    { date: 'Feb 5', price: 4300 },
  ];

  return (
    <div className="p-8 bg-background">
      <PriceTrendChart route="Delhi → Mumbai" data={mockData} predictedData={predictedData} />
    </div>
  );
}
