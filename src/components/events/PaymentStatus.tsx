import React from 'react';
import { Check, Clock, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PaymentStatusProps {
  isPaid: boolean;
  onPayNow?: () => void;
  size?: 'sm' | 'default';
  showPayButton?: boolean;
}

export function PaymentStatus({ 
  isPaid, 
  onPayNow, 
  size = 'default',
  showPayButton = true 
}: PaymentStatusProps) {
  const isSmall = size === 'sm';

  return (
    <div className={cn(
      "flex items-center gap-2",
      isSmall ? "text-sm" : "text-base"
    )}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className={cn(
              "flex items-center gap-1.5",
              isPaid ? "text-green-500" : "text-yellow-500"
            )}>
              {isPaid ? (
                <>
                  <Check className={cn("", isSmall ? "h-4 w-4" : "h-5 w-5")} />
                  <span>Paid</span>
                </>
              ) : (
                <>
                  <Clock className={cn("", isSmall ? "h-4 w-4" : "h-5 w-5")} />
                  <span>Payment Pending</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isPaid 
                ? 'Consultancy fee has been paid' 
                : 'Consultancy fee payment is pending'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {!isPaid && showPayButton && onPayNow && (
        <Button
          variant="outline"
          size={isSmall ? "sm" : "default"}
          onClick={onPayNow}
          className="ml-2"
        >
          <CreditCard className={cn("mr-2", isSmall ? "h-3 w-3" : "h-4 w-4")} />
          Pay Now
        </Button>
      )}
    </div>
  );
} 