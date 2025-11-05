import { Card } from "@/components/ui/card";
import { Brain, Users, Shield, Zap, TrendingUp, Globe } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Brain,
      title: "AI-Powered",
      description: "Advanced machine learning algorithms analyze millions of data points to provide accurate price predictions."
    },
    {
      icon: Users,
      title: "User-Centric",
      description: "Built with travelers in mind, focusing on simplicity, transparency, and the best user experience."
    },
    {
      icon: Shield,
      title: "Trustworthy",
      description: "Secure platform with verified data from trusted sources across the travel industry."
    },
    {
      icon: Zap,
      title: "Fast & Efficient",
      description: "Lightning-fast search results comparing hundreds of flights in seconds."
    },
    {
      icon: TrendingUp,
      title: "Data-Driven",
      description: "Real-time price tracking and historical data analysis for informed booking decisions."
    },
    {
      icon: Globe,
      title: "Comprehensive",
      description: "Coverage of all major airlines and routes across India."
    }
  ];

  const stats = [
    { value: "50K+", label: "Happy Travelers" },
    { value: "₹2Cr+", label: "Saved for Users" },
    { value: "15+", label: "Airlines Covered" },
    { value: "100+", label: "Routes Analyzed" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold font-display bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent" data-testid="text-about-title">
              About SkaiLinker
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Revolutionizing flight booking with artificial intelligence
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-16">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-card via-card to-primary/5">
            <div className="max-w-3xl mx-auto space-y-6 text-center">
              <h2 className="text-3xl font-bold font-display">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
               SkaiLinker — discover smarter, book faster,and fly farther!
               At SkaiLinker, we believe booking the perfect flight should be simple, affordable, and accessible to everyone.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our mission is to democratize travel by providing everyone with access to AI-powered insights that were once 
                only available to industry professionals. We combine cutting-edge artificial intelligence with real-time data 
                from multiple sources using comparison tools to help you make informed decisions about when and where to book 
                your flights.
              </p>
            </div>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold font-display text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <Card key={idx} className="p-6 text-center hover-elevate transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold font-display text-primary mb-2" data-testid={`text-stat-value-${idx}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground" data-testid={`text-stat-label-${idx}`}>
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold font-display text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, idx) => (
              <Card key={idx} className="p-6 hover-elevate transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-md shadow-primary/10">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold font-display mb-2" data-testid={`text-value-title-${idx}`}>
                  {value.title}
                </h3>
                <p className="text-muted-foreground" data-testid={`text-value-desc-${idx}`}>
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
