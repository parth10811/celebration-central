import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarIcon, CreditCard } from 'lucide-react';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Props {
  onPrevStep: () => void;
  onNextStep: () => void;
  selectedType: string;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.date({
    required_error: 'Date is required',
  }),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string().min(1, 'Event type is required'),
  guests: z.number().min(1, 'At least 1 guest is required'),
  budget: z.number().min(0, 'Budget must be a positive number'),
  contactPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  contactEmail: z.string().email('Invalid email address')
});

type FormData = z.infer<typeof formSchema>;

export default function EventBasicDetailsForm({ onPrevStep, onNextStep, selectedType }: Props) {
  const navigate = useNavigate();
  const { addEvent, updateEvent } = useEvents();
  const { userData } = useAuth();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      date: undefined,
      location: '',
      description: '',
      type: selectedType,
      guests: 1,
      budget: 0,
      contactPhone: '',
      contactEmail: userData?.email || '',
    }
  });

  const handlePayment = async () => {
    setShowPaymentDialog(false);
    try {
      if (!createdEventId) return;
      
      // Here you would integrate with your payment gateway
      // For now, we'll simulate a successful payment
      await updateEvent(createdEventId, { consultancyFeePaid: true });
      
      toast({
        title: 'Payment Successful',
        description: 'Your event consultancy fee has been paid.',
      });
      
      navigate(`/event/${createdEventId}`);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Please try again or pay later from your dashboard.',
        variant: 'destructive',
      });
    }
  };

  const handlePayLater = async () => {
    setShowPaymentDialog(false);
    if (createdEventId) {
      toast({
        title: 'Payment Pending',
        description: 'You can complete the payment later from your dashboard.',
      });
      navigate(`/event/${createdEventId}`);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const eventData = {
        ...data,
        date: format(data.date, 'yyyy-MM-dd'),
        userRole: userData?.role,
        consultancyFeePaid: false
      };

      const eventId = await addEvent(eventData);
      setCreatedEventId(eventId);
      setShowPaymentDialog(true);
      
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="babyshower">Baby Shower</SelectItem>
                      <SelectItem value="graduation">Graduation</SelectItem>
                      <SelectItem value="houseparty">House Party</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Guests</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+91 1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contact@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter event description"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onPrevStep}>
              Back
            </Button>
            <Button type="submit">
              {form.formState.isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consultancy Fee Payment</DialogTitle>
            <DialogDescription>
              A consultancy fee of ₹999 is required for professional event planning assistance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Button 
              className="w-full" 
              onClick={handlePayment}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now (₹999)
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handlePayLater}
            >
              Pay Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
