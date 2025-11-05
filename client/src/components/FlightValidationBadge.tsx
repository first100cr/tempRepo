// client/src/components/FlightValidationBadge.tsx
// OPTIONAL COMPONENT - Shows validation status to users

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FlightValidationBadgeProps {
  isValidated?: boolean;
  priceLastUpdated?: string;
  compact?: boolean;
}

/**
 * Displays a badge indicating whether a flight has been validated in real-time
 * 
 * Usage in FlightResultsInline.tsx or FlightResultsModal.tsx:
 * 
 * <FlightValidationBadge 
 *   isValidated={flight.isValidated}
 *   priceLastUpdated={flight.priceLastUpdated}
 * />
 */
export default function FlightValidationBadge({
  isValidated = false,
  priceLastUpdated,
  compact = false
}: FlightValidationBadgeProps) {
  
  // Validated flight - real-time pricing confirmed
  if (isValidated) {
    return (
      <Badge 
        variant="default" 
        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
      >
        <CheckCircle2 className="h-3 w-3" />
        {!compact && <span>Verified Available</span>}
        {compact && <span>✓</span>}
        {priceLastUpdated && !compact && (
          <span className="text-xs opacity-80 ml-1">
            • {formatDistanceToNow(new Date(priceLastUpdated), { addSuffix: true })}
          </span>
        )}
      </Badge>
    );
  }
  
  // Not validated - cached data
  return (
    <Badge 
      variant="outline" 
      className="border-amber-500 text-amber-700 dark:text-amber-400 flex items-center gap-1"
    >
      <Clock className="h-3 w-3" />
      {!compact && <span>Cached Price</span>}
      {compact && <span>~</span>}
    </Badge>
  );
}

/**
 * Shows a tooltip with detailed validation information
 */
export function FlightValidationTooltip({
  isValidated,
  priceLastUpdated
}: FlightValidationBadgeProps) {
  if (isValidated) {
    return (
      <div className="text-xs space-y-1">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          <span>Real-Time Verified</span>
        </div>
        <p className="text-muted-foreground">
          This flight's availability and price have been confirmed in real-time.
        </p>
        {priceLastUpdated && (
          <p className="text-muted-foreground">
            Last updated: {formatDistanceToNow(new Date(priceLastUpdated), { addSuffix: true })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="text-xs space-y-1">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
        <Clock className="h-4 w-4" />
        <span>Cached Price</span>
      </div>
      <p className="text-muted-foreground">
        This price may have changed. Final price will be confirmed at booking.
      </p>
    </div>
  );
}

/**
 * Banner component to show validation statistics
 */
export function ValidationStatsBanner({ 
  validationStats 
}: { 
  validationStats?: { 
    total: number; 
    validated: number; 
    unvalidated: number; 
  } 
}) {
  if (!validationStats) return null;

  const successRate = Math.round((validationStats.validated / validationStats.total) * 100);

  return (
    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
            Real-Time Verification Complete
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            {validationStats.validated} of {validationStats.total} flights verified available with current pricing 
            ({successRate}% success rate). All prices shown are accurate as of now.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading state for validation
 */
export function ValidationLoadingBanner() {
  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
            Verifying Flight Availability
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Checking real-time availability and pricing for the best flights...
          </p>
        </div>
      </div>
    </div>
  );
}