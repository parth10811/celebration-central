import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, addDoc, query, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { db, auth, formatTimestamp, formatEventDate } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// Define event types
export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: string;
  guests: number;
  createdBy: string;
  createdAt: string;
  image?: string;
  budget?: number;
  contactPhone?: string;
  contactEmail?: string;
  userId?: string;
  userRole?: string;
  consultancyFeePaid?: boolean;
}

interface FirestoreEventItem {
  title: string;
  date: string;
  location: string;
  description: string;
  type: string;
  guests: number;
  createdBy: string;
  createdAt: Timestamp | null;
  image?: string;
  budget?: number;
  contactPhone?: string;
  contactEmail?: string;
  userId?: string;
  userRole?: string;
  consultancyFeePaid?: boolean;
}

interface EventContextType {
  events: EventItem[];
  loading: boolean;
  error: string | null;
  addEvent: (event: Omit<EventItem, 'id' | 'createdAt' | 'createdBy'>) => Promise<string>;
  getEvent: (id: string) => EventItem | undefined;
  updateEvent: (id: string, updatedEvent: Partial<EventItem>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  fetchEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useAuth();
  const { toast } = useToast();
  
  // Helper function to check if a value is a Timestamp
  const isTimestamp = (value: any): value is Timestamp => {
    return value && typeof value.toDate === 'function';
  };
  
  // Fetch events from Firestore
  const fetchEvents = async () => {
    console.log('Fetching events...', {
      hasUser: !!auth.currentUser,
      userData,
      loading
    });

    try {
      setLoading(true);
      setError(null);

      if (!auth.currentUser || !userData) {
        console.log('No authenticated user or user data found');
        setEvents([]);
        return;
      }

      // Create a query based on user role
      let eventsQuery;
      if (userData.role === 'admin') {
        console.log('Admin user detected - fetching all events');
        eventsQuery = query(collection(db, 'events'));
      } else {
        console.log('Customer user detected - fetching only their events');
        eventsQuery = query(
          collection(db, 'events'),
          where('createdBy', '==', auth.currentUser.uid)
        );
      }

      console.log('Executing Firestore query...');
      const querySnapshot = await getDocs(eventsQuery);
      console.log(`Found ${querySnapshot.docs.length} events`);

      const eventsData = querySnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreEventItem;
        console.log('Processing event:', {
          id: doc.id,
          title: data.title,
          createdBy: data.createdBy,
          type: data.type
        });
        
        try {
          return {
            ...data,
            id: doc.id,
            createdAt: isTimestamp(data.createdAt) 
              ? data.createdAt.toDate().toISOString() 
              : new Date().toISOString(),
            date: isTimestamp(data.date) 
              ? data.date.toDate().toISOString() 
              : data.date || new Date().toISOString()
          } as EventItem;
        } catch (error) {
          console.error('Error processing event data:', { id: doc.id, error });
          return null;
        }
      }).filter(Boolean) as EventItem[];

      console.log('Setting events:', {
        count: eventsData.length,
        userRole: userData.role
      });
      setEvents(eventsData);
      
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
      toast({
        title: "Error loading events",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive",
      });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper functions for data cleaning and generation
  
  // Check if the title appears to be random gibberish
  const looksRandom = (text: string = ''): boolean => {
    // Check for patterns that suggest random text (e.g., repeated characters, lack of spaces)
    if (!text) return true;
    if (text.length > 3 && text === text.charAt(0).repeat(text.length)) return true;
    if (text.length > 5 && !text.includes(' ')) return true;
    if (/^[a-z]{5,}$/i.test(text)) return true; // Just a string of letters with no spaces
    if (/^[a-z0-9]{5,}$/i.test(text) && !/\s/.test(text)) return true; // Random alphanumeric with no spaces
    
    // Random keyboard mashing patterns
    const commonRandomPatterns = ['asdf', 'qwer', 'zxcv', 'jkl', 'hjkl'];
    if (commonRandomPatterns.some(pattern => text.toLowerCase().includes(pattern))) return true;
    
    // Check for repeated patterns like "hahaha" or "lolol"
    if (/(.)\1{2,}/.test(text)) return true; // Three or more of the same character in a row
    if (/(.{2,})\1{2,}/.test(text)) return true; // Repeated pattern of 2+ characters

    return false;
  };
  
  // Clean an event title or generate a new one if it looks random
  const cleanEventTitle = (title: string = ''): string => {
    if (!title || looksRandom(title)) {
      return ''; // Will be replaced with a realistic title
    }
    return title;
  };
  
  // Clean a location or generate a new one if it looks random
  const cleanLocation = (location: string = ''): string => {
    if (!location || looksRandom(location)) {
      return '';
    }
    return location;
  };
  
  // Clean a description or generate a new one if it looks random
  const cleanDescription = (description: string = ''): string => {
    if (!description || looksRandom(description)) {
      return '';
    }
    return description;
  };
  
  // Generate a realistic event title based on event type
  const generateRealisticEventTitle = (type: string): string => {
    const names = ['Sam', 'Rahul', 'John', 'Emma', 'Sophia', 'Michael', 'Sarah', 'James', 'Priya', 'David', 'Olivia'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    switch(type.toLowerCase()) {
      case 'wedding':
        const secondName = names[Math.floor(Math.random() * names.length)];
        return `${randomName} & ${secondName}'s Wedding`;
      case 'birthday':
        return `${randomName}'s Birthday Party`;
      case 'corporate':
        const companies = ['TechCorp', 'GlobalSoft', 'InnovateTech', 'Nexus Labs', 'EcoSolutions'];
        const company = companies[Math.floor(Math.random() * companies.length)];
        return `${company} Annual Meeting`;
      case 'babyshower':
        return `${randomName}'s Baby Shower`;
      case 'graduation':
        return `${randomName}'s Graduation Celebration`;
      case 'houseparty':
        return `${randomName}'s House Party`;
      default:
        return `${randomName}'s ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    }
  };
  
  // Generate a realistic location based on event type
  const generateRealisticLocation = (type: string): string => {
    const cities = ['New York', 'San Francisco', 'Chicago', 'Los Angeles', 'Miami', 'Boston', 'Seattle', 'Austin', 'Denver', 'Atlanta'];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    switch(type.toLowerCase()) {
      case 'wedding':
        const venues = ['Grand Ballroom', 'Gardens', 'Plaza Hotel', 'Beachfront Resort', 'Vineyard Estate'];
        return `${venues[Math.floor(Math.random() * venues.length)]}, ${city}`;
      case 'birthday':
        const bdayVenues = ['Backyard', 'Rooftop Lounge', 'Park', 'Community Center', 'Restaurant'];
        return `${bdayVenues[Math.floor(Math.random() * bdayVenues.length)]}, ${city}`;
      case 'corporate':
        const corpVenues = ['Convention Center', 'Corporate HQ', 'Hotel Conference Room', 'Business Center', 'Tech Campus'];
        return `${corpVenues[Math.floor(Math.random() * corpVenues.length)]}, ${city}`;
      default:
        const defaultVenues = ['Community Hall', 'Hotel', 'Event Space', 'Private Venue', 'Public Park'];
        return `${defaultVenues[Math.floor(Math.random() * defaultVenues.length)]}, ${city}`;
    }
  };
  
  // Generate a realistic description based on event type
  const generateRealisticDescription = (type: string): string => {
    switch(type.toLowerCase()) {
      case 'wedding':
        return "Join us for our special day as we celebrate our love and commitment. The ceremony will be followed by dinner and dancing.";
      case 'birthday':
        return "Celebrating another trip around the sun! Food, drinks, and cake will be provided. Bring your good vibes and party spirit.";
      case 'corporate':
        return "Annual company gathering to discuss achievements, goals, and future plans. Business casual attire. Lunch and refreshments will be served.";
      case 'babyshower':
        return "Help us welcome our little one into the world! Games, gifts, and light refreshments. Please RSVP by the date indicated.";
      case 'graduation':
        return "Celebrating academic achievements and new beginnings. Join us for food, photos, and fun as we mark this important milestone.";
      case 'houseparty':
        return "Come over for a casual get-together with friends. Good company, food, and drinks. Feel free to bring something to share.";
      default:
        return "Join us for this special event. More details will be provided soon. We look forward to seeing you there!";
    }
  };
  
  // Get a random event image based on type
  const getRandomEventImage = (type: string): string => {
    const imagesByType: Record<string, string[]> = {
      wedding: [
        'https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80'
      ],
      birthday: [
        'https://images.unsplash.com/photo-1532117182044-474a3e67c8fa?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=800&q=80'
      ],
      corporate: [
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80'
      ],
      babyshower: [
        'https://images.unsplash.com/photo-1543342384-1f1350e27861?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80'
      ],
      graduation: [
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80'
      ],
      houseparty: [
        'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80'
      ]
    };
    
    const defaultImages = [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'
    ];
    
    const images = imagesByType[type.toLowerCase()] || defaultImages;
    return images[Math.floor(Math.random() * images.length)];
  };
  
  // Create sample events for demonstration
  const createSampleEvents = (): EventItem[] => {
    return [
      {
        id: 'sample-1',
        title: "Sophia's Birthday Party",
        date: "Aug 15, 2023 at 2:00 PM",
        location: "Riverside Park, New York",
        description: "Join us to celebrate Sophia turning 30! There will be food, drinks, games, and lots of fun. Casual attire suggested.",
        type: "birthday",
        guests: 35,
        createdBy: "user-1",
        createdAt: "July 1, 2023",
        image: "https://images.unsplash.com/photo-1532117182044-474a3e67c8fa?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: 'sample-2',
        title: "Rahul & Priya's Wedding",
        date: "Dec 12, 2023 at 11:00 AM",
        location: "Grand Hyatt, Mumbai",
        description: "We're tying the knot! Join us for our wedding ceremony and reception. Traditional attire encouraged.",
        type: "wedding",
        guests: 150,
        createdBy: "user-1",
        createdAt: "June 15, 2023",
        image: "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: 'sample-3',
        title: "TechCorp Annual Conference",
        date: "Sep 20, 2023 at 9:00 AM",
        location: "Tech Hub, San Francisco",
        description: "Annual company meeting to discuss goals, achievements, and future plans. Business casual attire. Lunch and refreshments will be served.",
        type: "corporate",
        guests: 75,
        createdBy: "user-1",
        createdAt: "July 5, 2023",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: 'sample-4',
        title: "Sarah's Graduation Celebration",
        date: "June 15, 2023 at 3:00 PM",
        location: "Thompson Park, Chicago",
        description: "Celebrating Sarah's graduation from University of Chicago! Join us for food, photos, and fun as we mark this important milestone.",
        type: "graduation",
        guests: 40,
        createdBy: "user-1",
        createdAt: "May 20, 2023",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"
      }
    ];
  };
  
  // Fetch events when auth state or user data changes
  useEffect(() => {
    console.log('Auth state or user data changed:', {
      hasUser: !!auth.currentUser,
      userRole: userData?.role
    });
    fetchEvents();
  }, [userData]);
  
  // Add a new event
  const addEvent = async (eventData: Omit<EventItem, 'id' | 'createdAt' | 'createdBy'>): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create the Firestore document data
      const firestoreData: FirestoreEventItem = {
        title: eventData.title,
        date: eventData.date,
        location: eventData.location,
        description: eventData.description,
        type: eventData.type,
        guests: eventData.guests,
        budget: eventData.budget,
        contactPhone: eventData.contactPhone,
        contactEmail: eventData.contactEmail,
        userId: user.uid,
        userRole: eventData.userRole,
        consultancyFeePaid: false,
        createdBy: user.uid,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'events'), firestoreData);
      await fetchEvents();
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding event:', error);
      setError('Failed to add event');
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Get a specific event by ID
  const getEvent = (id: string) => {
    return events.find((event) => event.id === id);
  };
  
  // Update an event
  const updateEvent = async (id: string, updatedEvent: Partial<EventItem>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const eventRef = doc(db, 'events', id);
      await updateDoc(eventRef, updatedEvent);
      
      setEvents(prev => prev.map(event => 
        event.id === id ? { ...event, ...updatedEvent } : event
      ));
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event');
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Delete an event
  const deleteEvent = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteDoc(doc(db, 'events', id));
      
      // Update local state
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
      
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      setError('Failed to delete event');
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <EventContext.Provider 
      value={{ 
        events, 
        addEvent,
        getEvent,
        updateEvent,
        deleteEvent,
        loading,
        error,
        fetchEvents
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
