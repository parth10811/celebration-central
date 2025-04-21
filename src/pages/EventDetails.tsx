import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '@/context/EventContext';
import { useVendors } from '@/context/VendorContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Share2,
  ArrowLeft,
  AlertCircle,
  Download,
  Sparkles,
  Wallet,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEvent, deleteEvent, updateEvent, loading, error } = useEvents();
  const { vendors } = useVendors();
  const { toast } = useToast();
  const { userData } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (id) {
        try {
          const eventData = await getEvent(id);
          setEvent(eventData);
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
  }, [id, getEvent]);

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
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <p>Event not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = () => {
    deleteEvent(event.id);
    toast({
      title: "Event deleted",
      description: "The event has been successfully deleted.",
    });
    setIsDeleteDialogOpen(false);
    navigate('/events');
  };
  
  const handleShare = () => {
    // In a real app, this would generate a shareable link
    const shareUrl = `${window.location.origin}/event/${event.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link copied to clipboard",
        description: "You can now share this event with others.",
      });
    });
  };

  const formatBudget = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen py-24 px-6">
        <div className="container max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/events')}
            className="mb-6 hover:bg-background"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          
          {/* Event Header */}
          <div className="relative">
            {event.image && (
              <div className="h-64 md:h-80 w-full overflow-hidden rounded-xl mb-6">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="relative z-20 -mt-16 px-6">
              <div className="bg-card shadow-lg rounded-xl p-6 border">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <Badge variant="outline" className="mb-2 capitalize">
                      {event.type}
                    </Badge>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">{event.title}</h1>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    {userData?.role === 'admin' && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/edit-event/${event.id}`)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {userData?.role === 'admin' && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                    <div className="flex flex-wrap gap-4">
                      {event.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{event.contactPhone}</span>
                        </div>
                      )}
                      {event.contactEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{event.contactEmail}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment Status</h3>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${event.consultancyFeePaid ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span className="text-sm">
                          {event.consultancyFeePaid 
                            ? 'Consultancy fee paid (₹5,000)'
                            : 'Consultancy fee pending (₹5,000)'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full justify-start mb-6">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="guests">Guest List</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Event Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Date</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(event.date), 'PPP')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Location</p>
                            <p className="text-sm text-muted-foreground">
                              {event.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Expected Guests</p>
                            <p className="text-sm text-muted-foreground">
                              {event.guests} people
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Wallet className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Budget</p>
                            <p className="text-sm text-muted-foreground">
                              {event.budget ? formatBudget(event.budget) : 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {event.description && (
                        <div className="border-t pt-6">
                          <h3 className="text-sm font-medium mb-2">Description</h3>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {event.description}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-primary" />
                        AI Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-accent/30 rounded-lg">
                        <h4 className="font-medium mb-2">Budget Allocation Suggestions</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.budget ? (
                            <>
                              For your {event.type} with a budget of {formatBudget(event.budget)}, we recommend:
                              {event.type === 'wedding' && (
                                <ul className="mt-2 list-disc list-inside">
                                  <li>Venue & Catering: {formatBudget(event.budget * 0.5)}</li>
                                  <li>Decor & Flowers: {formatBudget(event.budget * 0.15)}</li>
                                  <li>Photography & Video: {formatBudget(event.budget * 0.15)}</li>
                                  <li>Attire & Accessories: {formatBudget(event.budget * 0.1)}</li>
                                  <li>Music & Entertainment: {formatBudget(event.budget * 0.1)}</li>
                                </ul>
                              )}
                              {event.type === 'birthday' && (
                                <ul className="mt-2 list-disc list-inside">
                                  <li>Venue & Food: {formatBudget(event.budget * 0.4)}</li>
                                  <li>Decorations: {formatBudget(event.budget * 0.2)}</li>
                                  <li>Entertainment: {formatBudget(event.budget * 0.2)}</li>
                                  <li>Cake & Desserts: {formatBudget(event.budget * 0.1)}</li>
                                  <li>Party Favors: {formatBudget(event.budget * 0.1)}</li>
                                </ul>
                              )}
                              {event.type === 'corporate' && (
                                <ul className="mt-2 list-disc list-inside">
                                  <li>Venue & Setup: {formatBudget(event.budget * 0.35)}</li>
                                  <li>Catering & Beverages: {formatBudget(event.budget * 0.3)}</li>
                                  <li>AV Equipment: {formatBudget(event.budget * 0.15)}</li>
                                  <li>Decor & Signage: {formatBudget(event.budget * 0.1)}</li>
                                  <li>Staff & Management: {formatBudget(event.budget * 0.1)}</li>
                                </ul>
                              )}
                              {!['wedding', 'birthday', 'corporate'].includes(event.type) && (
                                <ul className="mt-2 list-disc list-inside">
                                  <li>Venue & Space: {formatBudget(event.budget * 0.4)}</li>
                                  <li>Food & Beverages: {formatBudget(event.budget * 0.3)}</li>
                                  <li>Decorations: {formatBudget(event.budget * 0.15)}</li>
                                  <li>Entertainment: {formatBudget(event.budget * 0.15)}</li>
                                </ul>
                              )}
                            </>
                          ) : (
                            "Please set a budget to receive personalized allocation suggestions."
                          )}
                        </p>
                      </div>
                      <div className="p-4 bg-accent/30 rounded-lg">
                        <h4 className="font-medium mb-2">Recommended Next Steps</h4>
                        <p className="text-sm text-muted-foreground">
                          Based on your {event.type} event{event.budget ? ` and ${formatBudget(event.budget)} budget` : ''}, we suggest:
                          <ul className="mt-2 list-disc list-inside">
                            {event.budget ? (
                              <>
                                <li>Start venue hunting within {formatBudget(event.budget * 0.4)} range</li>
                                <li>Research vendors that match your budget segment</li>
                                <li>Create a detailed shopping list</li>
                              </>
                            ) : (
                              <li>Set your event budget to get personalized recommendations</li>
                            )}
                          </ul>
                        </p>
                      </div>
                      <div className="p-4 bg-accent/30 rounded-lg">
                        <h4 className="font-medium mb-2">Popular Venue Suggestions</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.budget ? (
                            <>
                              Based on your budget of {formatBudget(event.budget)}, here are some venue options:
                              {event.type === 'wedding' && (
                                <ul className="mt-2 list-disc list-inside">
                                  {event.budget >= 1000000 ? (
                                    <>
                                      <li>Luxury Hotels (Taj, Oberoi, ITC)</li>
                                      <li>Heritage Palaces (Umaid Bhawan, Rambagh)</li>
                                      <li>5-Star Resorts (Leela, JW Marriott)</li>
                                    </>
                                  ) : event.budget >= 500000 ? (
                                    <>
                                      <li>4-Star Hotels (Radisson, Hyatt)</li>
                                      <li>Banquet Halls (The Grand, The Leela)</li>
                                      <li>Garden Venues (Jaypee Greens, DLF Golf Club)</li>
                                    </>
                                  ) : (
                                    <>
                                      <li>Community Halls</li>
                                      <li>Local Banquet Halls</li>
                                      <li>Garden Venues</li>
                                    </>
                                  )}
                                </ul>
                              )}
                              {event.type === 'birthday' && (
                                <ul className="mt-2 list-disc list-inside">
                                  {event.budget >= 100000 ? (
                                    <>
                                      <li>Theme Restaurants (Hard Rock Cafe, Social)</li>
                                      <li>Rooftop Venues (The Sky Lounge, The Beer Cafe)</li>
                                      <li>Party Halls (Party Hard, The Party Place)</li>
                                    </>
                                  ) : event.budget >= 50000 ? (
                                    <>
                                      <li>Local Restaurants</li>
                                      <li>Community Centers</li>
                                      <li>Garden Venues</li>
                                    </>
                                  ) : (
                                    <>
                                      <li>Home Garden</li>
                                      <li>Local Parks</li>
                                      <li>Community Halls</li>
                                    </>
                                  )}
                                </ul>
                              )}
                              {event.type === 'corporate' && (
                                <ul className="mt-2 list-disc list-inside">
                                  {event.budget >= 500000 ? (
                                    <>
                                      <li>5-Star Hotels (Taj, Oberoi, ITC)</li>
                                      <li>Convention Centers (Jio World, HICC)</li>
                                      <li>Business Hotels (Radisson, Hyatt)</li>
                                    </>
                                  ) : event.budget >= 200000 ? (
                                    <>
                                      <li>4-Star Hotels</li>
                                      <li>Business Centers</li>
                                      <li>Co-working Spaces</li>
                                    </>
                                  ) : (
                                    <>
                                      <li>Local Conference Halls</li>
                                      <li>Community Centers</li>
                                      <li>Office Meeting Rooms</li>
                                    </>
                                  )}
                                </ul>
                              )}
                            </>
                          ) : (
                            "Please set a budget to receive venue suggestions."
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="guests" className="min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Guest management feature coming soon</p>
                    <Button variant="outline">Add Guests</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="tasks" className="min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Task management feature coming soon</p>
                    <Button variant="outline">Create Task</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" onClick={() => navigate('/ai-assistant')}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get More AI Ideas
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Details
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Wallet className="h-5 w-5 mr-2 text-primary" />
                    Budget & Vendor Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Budget</span>
                      <span className="text-lg font-semibold">{formatBudget(event.budget || 0)}</span>
                    </div>

                    {event.budget ? (
                      <div className="space-y-6">
                        {/* Catering Suggestions */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Catering Suggestions</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vendors
                              .filter(v => v.type === 'catering')
                              .slice(0, 2)
                              .map(vendor => (
                                <div key={vendor.id} className="border rounded-lg p-4 space-y-2">
                                  <div className="flex justify-between items-start">
                                    <h5 className="font-medium">{vendor.name}</h5>
                                    <span className="text-sm text-muted-foreground">
                                      {formatBudget(vendor.pricePerPerson * event.guests)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{vendor.description}</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => navigate(`/vendor/${vendor.id}`)}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Venue Suggestions */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Venue Suggestions</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vendors
                              .filter(v => v.type === 'venue')
                              .slice(0, 2)
                              .map(vendor => (
                                <div key={vendor.id} className="border rounded-lg p-4 space-y-2">
                                  <div className="flex justify-between items-start">
                                    <h5 className="font-medium">{vendor.name}</h5>
                                    <span className="text-sm text-muted-foreground">
                                      {formatBudget(vendor.pricePerPerson * event.guests)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{vendor.description}</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => navigate(`/vendor/${vendor.id}`)}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Music Suggestions */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Music & Entertainment</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vendors
                              .filter(v => v.type === 'music')
                              .slice(0, 2)
                              .map(vendor => (
                                <div key={vendor.id} className="border rounded-lg p-4 space-y-2">
                                  <div className="flex justify-between items-start">
                                    <h5 className="font-medium">{vendor.name}</h5>
                                    <span className="text-sm text-muted-foreground">
                                      {formatBudget(vendor.pricePerPerson * event.guests)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{vendor.description}</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => navigate(`/vendor/${vendor.id}`)}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Decoration Suggestions */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Decoration & Styling</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vendors
                              .filter(v => v.type === 'decoration')
                              .slice(0, 2)
                              .map(vendor => (
                                <div key={vendor.id} className="border rounded-lg p-4 space-y-2">
                                  <div className="flex justify-between items-start">
                                    <h5 className="font-medium">{vendor.name}</h5>
                                    <span className="text-sm text-muted-foreground">
                                      {formatBudget(vendor.pricePerPerson * event.guests)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{vendor.description}</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => navigate(`/vendor/${vendor.id}`)}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            These suggestions are based on your event type ({event.type}) and budget. 
                            Click "View Details" to learn more about each vendor or visit our 
                            <Button 
                              variant="link" 
                              className="px-1 h-auto" 
                              onClick={() => navigate('/vendors')}
                            >
                              vendors page
                            </Button>
                            to explore more options.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Set your event budget to receive personalized vendor suggestions.
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => navigate(`/edit-event/${event.id}`)}
                        >
                          Set Budget
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </>
  );
};

export default EventDetails;

