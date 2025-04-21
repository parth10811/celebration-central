import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, Gift, Plus, Users, Clock, MapPin, Sparkles, ListTodo } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvents } from '@/context/EventContext';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatEventDate } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { events, loading: eventsLoading, refreshEvents } = useEvents();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initial setup and auth check
  useEffect(() => {
    console.log('Dashboard mounted');
    console.log('Auth state:', {
      user,
      authLoading,
      isAuthenticated: !!user
    });

    const initializeDashboard = async () => {
      try {
        if (authLoading) {
          console.log('Auth still loading...');
          return;
        }

        if (!user) {
          console.log('No authenticated user, redirecting to login');
          toast({
            title: "Authentication required",
            description: "Please log in to view your dashboard",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        console.log('Refreshing events for user:', user.uid);
        await refreshEvents();
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        toast({
          title: "Error loading dashboard",
          description: "There was a problem loading your events. Please try again.",
          variant: "destructive"
        });
      }
    };

    initializeDashboard();
  }, [user, authLoading]);

  // Monitor events state
  useEffect(() => {
    console.log('Events state:', {
      loading: eventsLoading,
      eventsCount: events.length,
      events
    });
  }, [eventsLoading, events]);
  
  // Filter and sort upcoming events
  const upcomingEvents = React.useMemo(() => {
    console.log('Filtering upcoming events');
    if (!user) {
      console.log('No authenticated user, returning empty array');
      return [];
    }

    const now = new Date();
    
    // Filter by current user
    const userEvents = events.filter(event => {
      const isUsersEvent = event.createdBy === user.uid;
      console.log('Event ownership check:', {
        eventId: event.id,
        eventCreator: event.createdBy,
        currentUser: user.uid,
        isUsersEvent
      });
      return isUsersEvent;
    });
    
    console.log('User events found:', userEvents.length);
    
    // Filter by date and sort
    const filtered = userEvents
      .filter(event => {
        if (!event.date) {
          console.log('Event has no date:', event.id);
          return false;
        }
        
        try {
          const eventDate = new Date(event.date);
          const isUpcoming = !isNaN(eventDate.getTime()) && eventDate >= now;
          console.log('Date check for event:', {
            eventId: event.id,
            eventDate,
            isUpcoming
          });
          return isUpcoming;
        } catch (e) {
          console.error('Error parsing date for event:', event.id, e);
          return false;
        }
      })
      .sort((a, b) => {
        try {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } catch (e) {
          console.error('Error sorting events:', e);
          return 0;
        }
      })
      .slice(0, 2);
    
    console.log('Filtered upcoming events:', filtered);
    return filtered;
  }, [events, user]);

  // Realistic AI suggestions based on the events
  const generatePersonalizedInsights = (eventList: Array<any>) => {
    const defaultInsights = [
      "Add a photo booth with vintage props for Sarah's Birthday Party",
      "For John & Emma's Wedding, consider outdoor cooling stations for guest comfort",
      "Create signature cocktails themed around David's House Party for a personalized experience"
    ];
    
    if (!eventList || eventList.length === 0) return defaultInsights;
    
    const insights = [];
    
    // Generate insights based on actual events
    for (const event of eventList) {
      if (insights.length >= 3) break;
      
      switch(event.type?.toLowerCase()) {
        case 'wedding':
          insights.push(`For ${event.title}, consider hiring a live band for the reception to create a memorable atmosphere`);
          insights.push(`Add a designated photo area with thematic props at ${event.title} for social media moments`);
          break;
        case 'birthday':
          insights.push(`For ${event.title}, create a personalized playlist with the guest of honor's favorite songs`);
          insights.push(`Consider a themed cake that reflects ${event.title.split("'s")[0]}'s hobbies or interests`);
          break;
        case 'corporate':
          insights.push(`For ${event.title}, add interactive polling during presentations to boost engagement`);
          insights.push(`Arrange networking activities for attendees at ${event.title} to build team connections`);
          break;
        case 'graduation':
          insights.push(`Create a memory wall for guests to leave messages at ${event.title}`);
          insights.push(`For ${event.title}, set up a professional photographer for formal and casual shots`);
          break;
        default:
          insights.push(`Add personal touches like custom place cards for ${event.title}`);
          insights.push(`Consider the venue lighting to set the right mood for ${event.title}`);
      }
    }
    
    // If we don't have enough insights, add some generic ones
    while (insights.length < 3) {
      insights.push(defaultInsights[insights.length]);
    }
    
    return insights;
  };

  const aiInsights = generatePersonalizedInsights(events);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    }
  };

  // Loading state
  if (authLoading || eventsLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-24 px-6">
          <div className="container mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-muted rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen py-24 px-6 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            className="container mx-auto"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
              variants={itemVariants}
            >
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Your Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">Manage your upcoming events and planning tasks</p>
              </div>
              <Link to="/create-event">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            </motion.div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content - Events */}
              <motion.div 
                className="lg:col-span-2 space-y-6"
                variants={itemVariants}
              >
                <Card className="glass-effect card-hover border-2 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="flex items-center text-2xl font-display">
                        <Calendar className="h-6 w-6 mr-2 text-primary" />
                        Upcoming Events
                      </CardTitle>
                      <CardDescription className="text-base">Manage your scheduled events</CardDescription>
                    </div>
                    <Link to="/events">
                      <Button variant="ghost" size="sm" className="gap-1 text-primary group button-hover">
                        View All
                        <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents.length > 0 ? (
                      <motion.div 
                        className="space-y-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {upcomingEvents.map((event) => (
                          <motion.div
                            key={event.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <Card className="glass-effect card-hover border-muted transition-all duration-300">
                              <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <Badge variant="outline" className="capitalize text-xs glass-effect">
                                        {event.type}
                                      </Badge>
                                    </div>
                                    <h3 className="text-xl font-display font-semibold mb-2">{event.title}</h3>
                                    <div className="grid grid-cols-2 gap-1 text-sm">
                                      <div className="flex items-center text-muted-foreground">
                                        <Clock size={14} className="mr-1" />
                                        {formatEventDate(event.date)}
                                      </div>
                                      <div className="flex items-center text-muted-foreground">
                                        <MapPin size={14} className="mr-1" />
                                        {event.location}
                                      </div>
                                      <div className="flex items-center text-muted-foreground col-span-2">
                                        <Users size={14} className="mr-1" />
                                        {event.guests} guests
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-row sm:flex-col gap-2">
                                    <Link to={`/event/${event.id}`} className="flex-1">
                                      <Button size="sm" variant="outline" className="mb-2 w-full transition-colors button-hover">
                                        <FileText size={14} className="mr-1" />
                                        View
                                      </Button>
                                    </Link>
                                    <Link to={`/ai-assistant?eventId=${event.id}`} className="flex-1">
                                      <Button size="sm" className="w-full transition-colors button-hover">
                                        <Sparkles size={14} className="mr-1 animate-pulse-slow" />
                                        AI Ideas
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-accent/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                          <Calendar size={24} />
                        </div>
                        <h3 className="text-lg font-display font-medium mb-2">No events yet</h3>
                        <p className="text-muted-foreground mb-4">Create your first event to get started</p>
                        <Link to="/create-event">
                          <Button className="button-hover transition-transform hover:scale-105 duration-200">
                            <Plus size={16} className="mr-2" />
                            Create Event
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <motion.div variants={itemVariants}>
                  <Card className="glass-effect card-hover border-2 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center text-2xl font-display">
                        <ListTodo className="h-6 w-6 mr-2 text-primary" />
                        Planning Tasks
                      </CardTitle>
                      <CardDescription className="text-base">Track your event planning progress</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-8">
                        <div className="bg-accent/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                          <ListTodo size={24} />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Task management</h3>
                        <p className="text-muted-foreground mb-4">Create and track tasks for your events</p>
                        <Button variant="outline" className="transition-transform hover:scale-105 duration-200">
                          Coming Soon
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Sidebar */}
              <motion.div 
                className="space-y-6"
                variants={itemVariants}
              >
                <Card className="glass-effect card-hover border-2 border-primary/20 transition-all duration-300">
                  <CardHeader className="bg-accent/30 rounded-t-lg">
                    <CardTitle className="flex items-center text-2xl font-display">
                      <Sparkles className="h-6 w-6 mr-2 text-primary animate-pulse" />
                      AI Insights
                    </CardTitle>
                    <CardDescription className="text-base">Personalized suggestions for your events</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <motion.ul 
                      className="space-y-3"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {aiInsights.map((insight, index) => (
                        <motion.li 
                          key={index} 
                          className="flex p-2 rounded-lg hover:bg-accent/20 transition-colors"
                          variants={itemVariants}
                        >
                          <span className="mr-2 text-primary">💡</span>
                          <p className="text-sm">{insight}</p>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </CardContent>
                  <CardFooter>
                    <Link to="/ai-assistant" className="w-full">
                      <Button variant="outline" size="sm" className="w-full transition-transform hover:scale-105 duration-200">
                        Get More Ideas
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <motion.div variants={itemVariants}>
                  <Card className="glass-effect card-hover transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center text-2xl font-display">
                        <Gift className="h-6 w-6 mr-2 text-primary" />
                        Vendor Marketplace
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-6">
                        <div className="bg-accent/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                          <Gift size={24} />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Find Perfect Vendors</h3>
                        <p className="text-muted-foreground text-sm mb-4">Browse our curated vendor marketplace for your event needs</p>
                        <Button size="sm" className="w-full transition-transform hover:scale-105 duration-200">
                          Coming Soon
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Dashboard;
