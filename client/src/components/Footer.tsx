import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plane, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin, Cloud } from "lucide-react";
import { Link } from "wouter";
import skailinker_icon from "@assets/generated_images/SkaiLinker_Icon.png";

export default function Footer() {
  return (
    <footer className="bg-card/50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
           <Link href="/">
            <a className="flex items-center gap-2 group cursor-pointer">
              <div className="relative h-8 w-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20 overflow-visible">
                <img src={skailinker_icon} alt="Custom Icon" className="h-8 w-8 object-contain z-10 rounded-lg" />
              </div>
              <span className="text-xl font-bold font-display bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent" data-testid="text-logo">
                SkaiLinker
              </span>
            </a>
          </Link>
            <p className="text-muted-foreground max-w-sm">
              Your intelligent flight booking companion. Compare prices, predict trends, and book the best flight deals worldwide with AI-powered insights.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Pune, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@skailinker.org</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold font-display mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/flights">
                  <a className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="footer-link-flights">
                    Search Flights
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/predictions">
                  <a className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="footer-link-predictions">
                    Price Predictions
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/deals">
                  <a className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="footer-link-deals">
                    Best Deals
                  </a>
                </Link>
              </li>
              <li>
                <button className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="footer-link-alerts">
                  Price Alerts
                </button>
              </li>
               <li>
                  <a href="https://earnview.space" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="footer-link-flights">
                    View Ad and Earn
                  </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold font-display mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="footer-link-about">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <button className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="footer-link-careers">
                  Careers
                </button>
              </li>
              <li>
                <button className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="footer-link-press">
                  Press
                </button>
              </li>
               <li>
                  <a href="https://skailinker.blogspot.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="footer-link-flights">
                    Blogs
                  </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold font-display mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <button className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="footer-link-help">
                  Help Center
                </button>
              </li>
              <li>
                <button className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="footer-link-contact">
                  Contact Us
                </button>
              </li>
              <li>  
              <Link href="/privacy">
                  <a className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="footer-link-deals">
                    Privacy Policy
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="footer-link-deals">
                    Terms of Service
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-6 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} SkaiLinker. All rights reserved.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-9 w-9 hover-elevate" data-testid="social-facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover-elevate" data-testid="social-twitter">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover-elevate" data-testid="social-instagram">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover-elevate" data-testid="social-linkedin">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pb-8">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="font-semibold font-display text-lg mb-1">Stay Updated</h3>
                <p className="text-sm text-muted-foreground">Get the latest flight deals and AI insights delivered to your inbox</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto md:min-w-[300px]">
                <Input 
                  type="email" 
                  placeholder="Enter your WhatsApp number or email" 
                  className="flex-1"
                  data-testid="input-newsletter-email"
                />
                <Button className="bg-primary hover:bg-primary/90" data-testid="button-subscribe">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
