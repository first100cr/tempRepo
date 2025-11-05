import FeatureCard from '../FeatureCard';
import { Brain, TrendingDown, Bell } from 'lucide-react';

export default function FeatureCardExample() {
  return (
    <div className="p-8 bg-background grid md:grid-cols-3 gap-6">
      <FeatureCard
        icon={Brain}
        title="AI Price Predictions"
        description="Advanced algorithms predict price trends to help you book at the perfect time."
      />
      <FeatureCard
        icon={TrendingDown}
        title="Multi-Source Comparison"
        description="Compare flights from all major airlines and booking platforms in one place."
      />
      <FeatureCard
        icon={Bell}
        title="Price Alerts"
        description="Get notified when prices drop for your favorite routes and destinations."
      />
    </div>
  );
}
