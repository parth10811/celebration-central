import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Save, Loader2 } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string().min(1, 'Event type is required'),
  guests: z.number().min(1, 'Number of guests is required'),
  budget: z.number().min(0, 'Budget must be a positive number'),
  contact: z.object({
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    email: z.string().email('Invalid email address'),
  }),
});

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEvent, updateEvent, loading, error } = useEvents();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      date: '',
      location: '',
      description: '',
      type: '',
      guests: 0,
      budget: 0,
      contact: {
        phone: '',
        email: '',
      },
    },
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (id) {
        try {
          const eventData = await getEvent(id);
          if (eventData) {
            form.reset({
              title: eventData.title,
              date: eventData.date,
              location: eventData.location,
              description: eventData.description,
              type: eventData.type,
              guests: eventData.guests,
              budget: eventData.budget,
              contact: {
                phone: eventData.contact.phone,
                email: eventData.contact.email,
              },
            });
          }
        } catch (err) {
          toast({
            title: 'Error',
            description: 'Failed to fetch event details',
            variant: 'destructive',
          });
        }
      }
    };

    fetchEvent();
  }, [id, getEvent, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!id) return;

    try {
      await updateEvent(id, values);
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
      navigate(`/event/${id}`);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen py-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/event/${id}`)}
            className="mb-6 hover:bg-background"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Button>
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 slide-in-bottom">Edit Event</h1>
            <p className="text-muted-foreground slide-in-bottom delay-100">Make changes to your event details</p>
          </div>
          
          <Card className="border-2 slide-in-bottom delay-200">
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input type="date" {...field} />
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
                            <Input {...field} />
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
                              <SelectItem value="social">Social</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
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
                    
                    {user?.role === 'admin' && (
                      <>
                        <FormField
                          control={form.control}
                          name="contact.phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input type="tel" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contact.email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Event'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default EditEvent;
