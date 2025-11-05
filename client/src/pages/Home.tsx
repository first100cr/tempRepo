// client/src/pages/Home.tsx
// FIXED - Passes search parameters to flights page via URL

import { useState } from "react";
import { useLocation } from "wouter";
import { Sparkles, TrendingUp, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import FlightSearchForm from "@/components/FlightSearchForm";
import airportHero from "@assets/generated_images/Airport_terminal_hero_background_9e80665b.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchStart = () => {
    setIsSearching(true);
  };

  const handleSearchComplete = (data: any) => {
    setIsSearching(false);
    
    // Build URL with search parameters
    const params = new URLSearchParams();
    if (data.searchParams) {
      params.set('origin', data.searchParams.origin);
      params.set('destination', data.searchParams.destination);
      params.set('departDate', data.searchParams.departDate);
      if (data.searchParams.returnDate) {
        params.set('returnDate', data.searchParams.returnDate);
      }
      params.set('passengers', data.searchParams.passengers.toString());
      params.set('tripType', data.searchParams.tripType || 'round-trip');
      params.set('autoSearch', 'true'); // Flag to trigger auto-search
    }
    
    // Redirect to flights page with parameters
    setLocation(`/flights?${params.toString()}`);
  };

  const handleSearchError = (error: string) => {
    setIsSearching(false);
    console.error('Search error:', error);
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* HERO SECTION WITH AIRPORT BACKGROUND */}
      <section className="relative text-white overflow-hidden min-h-[600px] md:min-h-[700px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${airportHero})`,
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="h-10 w-10 md:h-12 md:w-12 text-yellow-300 drop-shadow-lg" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-2xl">
                SkaiLinker
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 mb-3 drop-shadow-lg">
              AI-Powered Flight Booking
            </p>
            <p className="text-base md:text-lg text-blue-200 max-w-2xl mx-auto mb-8 drop-shadow-md">
              Compare prices across all airlines. Get AI predictions for the best flight booking time.
            </p>
          </div>

          {/* FLIGHT SEARCH FORM */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/30 shadow-2xl">
              <FlightSearchForm 
                onSearchStart={handleSearchStart}
                onSearchComplete={handleSearchComplete}
                onSearchError={handleSearchError}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-12">
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-3 border border-white/20">
              <div className="text-2xl md:text-3xl font-bold mb-1 drop-shadow-lg">500+</div>
              <div className="text-xs md:text-sm text-blue-100">Airlines</div>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-3 border border-white/20">
              <div className="text-2xl md:text-3xl font-bold mb-1 drop-shadow-lg">1000+</div>
              <div className="text-xs md:text-sm text-blue-100">Destinations</div>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-3 border border-white/20">
              <div className="text-2xl md:text-3xl font-bold mb-1 drop-shadow-lg">₹850</div>
              <div className="text-xs md:text-sm text-blue-100">Avg Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SkaiLinker?</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Powered by advanced AI to help you find the best flight booking deals world-wide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
            <div className="text-center p-6 md:p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl">
              <div className="bg-blue-600 text-white w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-7 w-7 md:h-8 md:w-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">AI Price Predictions</h3>
              <p className="text-muted-foreground text-base md:text-lg">
                Our advanced algorithms predict price trends to help you book flights at the perfect time and save money.
              </p>
            </div>

            <div className="text-center p-6 md:p-8 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-2xl">
              <div className="bg-purple-600 text-white w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-7 w-7 md:h-8 md:w-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">Multi-Source Comparison</h3>
              <p className="text-muted-foreground text-base md:text-lg">
                Compare flight prices from all major airlines and booking platforms in one convenient place.
              </p>
            </div>

            <div className="text-center p-6 md:p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-2xl">
              <div className="bg-green-600 text-white w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="h-7 w-7 md:h-8 md:w-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">Price Alerts</h3>
              <p className="text-muted-foreground text-base md:text-lg">
                Get notified when prices drop for your favorite routes and destinations. Never miss a deal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Find your perfect flight in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Search Flights</h3>
                <p className="text-muted-foreground">
                  Enter your travel details and let our AI search across hundreds of airlines
                </p>
              </div>
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent -z-10" style={{ width: 'calc(100% - 4rem)' }}></div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Compare Prices</h3>
                <p className="text-muted-foreground">
                  View AI-powered predictions and compare prices from multiple sources
                </p>
              </div>
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent -z-10" style={{ width: 'calc(100% - 4rem)' }}></div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Book & Save</h3>
                <p className="text-muted-foreground">
                  Book at the right time and save up to ₹850 per ticket on average
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              size="lg"
              className="text-lg px-8 py-6"
            >
              <Search className="mr-2 h-5 w-5" />
              Start Your Search
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 SkaiLinker. AI-Powered Flight Booking Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}