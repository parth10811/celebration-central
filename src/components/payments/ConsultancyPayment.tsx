import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ConsultancyPaymentProps {
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const ConsultancyPayment = ({ onPaymentSuccess, onCancel }: ConsultancyPaymentProps) => {
  const { toast } = useToast();
  const { userData } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUPIPayment = async () => {
    if (!userData || userData.role !== 'customer') {
      toast({
        title: "Error",
        description: "Only customers can make this payment",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate UPI payment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Generate a UPI payment link/QR code
      // 2. Handle the payment verification
      // 3. Update the payment status in your database
      
      setIsSuccess(true);
      toast({
        title: "Payment Successful",
        description: "Your consultancy fee has been paid successfully",
      });
      
      // Wait a moment before calling onPaymentSuccess
      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <h3 className="text-xl font-semibold">Payment Successful!</h3>
            <p className="text-muted-foreground text-center">
              Your consultancy fee of ₹5,000 has been paid successfully.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Consultancy Fee Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Payment Details</h3>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Consultancy Fee</span>
            <span className="font-medium">₹5,000</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Payment Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={handleUPIPayment}
              disabled={isProcessing}
            >
              <img src="/upi-logo.png" alt="UPI" className="h-8 w-8" />
              <span>Pay via UPI</span>
            </Button>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleUPIPayment} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay ₹5,000'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultancyPayment; 