import { Sparkles } from "lucide-react";
import airportHero from "@assets/generated_images/Airport_terminal_hero_background_9e80665b.png";

interface HeroProps {
  children?: React.ReactNode;
}

export default function Hero({ children }: HeroProps) {
  return (
    <div className="relative min-h-[650px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center animate-[scale_20s_ease-in-out_infinite]"
        style={{ 
          backgroundImage: `url(${airportHero})`,
          animationDirection: 'alternate'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-background" />
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-40" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12 space-y-6">
          <div className="flex items-center justify-center gap-2 animate-[fadeIn_1s_ease-out]">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <div className="absolute inset-0 h-6 w-6 text-primary animate-ping opacity-30" />
            </div>
            <span className="text-primary font-medium tracking-wide">AI-Powered Flight Booking</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-white mb-4 animate-[fadeIn_1.2s_ease-out] bg-gradient-to-r from-white via-white to-primary/80 bg-clip-text text-transparent" data-testid="text-hero-title">
            Find Your Perfect Flight
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto animate-[fadeIn_1.4s_ease-out]" data-testid="text-hero-subtitle">
            Compare prices across all airlines. Get AI predictions for the best flight booking time.
          </p>
        </div>

        <div className="animate-[fadeIn_1.6s_ease-out]">
          {children}
        </div>
      </div>
    </div>
  );
}
