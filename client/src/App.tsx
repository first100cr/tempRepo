// client/src/App.tsx
// ✅ UPDATED - Wraps app with AuthProvider for instant state sharing

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import Home from "@/pages/Home";
import Flights from "@/pages/Flights";
import Predictions from "@/pages/Predictions";
import Deals from "@/pages/Deals";
import About from "@/pages/About";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";

// Your Google Client ID (already configured)
const GOOGLE_CLIENT_ID = '598503571962-1pkj41acqql4csulutspvt4g4ffbcggp.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background flex flex-col">
              <Header />
              <div className="flex-1">
                <Switch>
                  {/* ========================================
                      PUBLIC PAGES - No Login Required
                      ======================================== */}
                  <Route path="/" component={Home} />
                  <Route path="/flights" component={Flights} />
                  <Route path="/deals" component={Deals} />
                  <Route path="/about" component={About} />
                  <Route path="/privacy" component={Privacy} />
                  <Route path="/terms" component={Terms} />
                  
                  {/* ========================================
                      PROTECTED PAGES - Login Required
                      ======================================== */}
                  <Route path="/predictions">
                    <AuthGuard>
                      <Predictions />
                    </AuthGuard>
                  </Route>
                  
                  {/* ========================================
                      404 NOT FOUND
                      ======================================== */}
                  <Route component={NotFound} />
                </Switch>
              </div>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;