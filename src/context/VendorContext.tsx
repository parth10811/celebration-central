import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, getDocs, doc, getDoc, where, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

export interface Vendor {
  id: string;
  name: string;
  type: string;
  location: string;
  address: string;
  rating: number;
  reviews: number;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  phone: string;
  email: string;
  website: string;
  hours: string;
  description: string;
  services: string[];
  images: string[];
  specialties: string[];
  availability: boolean;
  responseTime: string;
  experience: string;
}

interface QuotationRequest {
  vendorId: string;
  userId: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
  budget: number;
  requirements?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

interface VendorContextType {
  vendors: Vendor[];
  getVendor: (id: string) => Vendor | undefined;
  loading: boolean;
  refreshVendors: () => Promise<void>;
  requestQuotation: (vendorId: string, data: Omit<QuotationRequest, 'userId' | 'status' | 'createdAt'>) => Promise<boolean>;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

// Mock data for development
const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Royal Wedding Planners',
    type: 'Event Planner',
    location: 'Mumbai, Maharashtra',
    address: 'Bandra West, Linking Road, Mumbai - 400050',
    rating: 4.9,
    reviews: 124,
    priceRange: {
      min: 150000,
      max: 1500000,
      currency: '₹'
    },
    phone: '+91 98765 43210',
    email: 'info@royalweddingplanners.com',
    website: 'royalweddingplanners.com',
    hours: 'Mon-Sat: 10AM-7PM',
    description: 'Royal Wedding Planners is a premium event management company specializing in luxury weddings and grand celebrations. With over 15 years of experience, we create unforgettable moments that reflect Indian traditions with a modern touch.',
    services: [
      'Complete wedding planning',
      'Venue selection and decoration',
      'Catering coordination',
      'Photography and videography',
      'Mehendi and sangeet arrangements',
      'Bridal trousseau consultation',
      'Wedding invitation design',
      'Transportation arrangements'
    ],
    images: [
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3',
      'https://images.unsplash.com/photo-1507504031003-b417219a0fde'
    ],
    specialties: ['Luxury Weddings', 'Destination Weddings', 'Traditional Ceremonies', 'Modern Weddings'],
    availability: true,
    responseTime: '2-4 hours',
    experience: '15+ years'
  },
  {
    id: '2',
    name: 'Spice & Flavors Catering',
    type: 'Catering',
    location: 'Delhi, NCR',
    address: 'Sector 18, Noida, Uttar Pradesh - 201301',
    rating: 4.8,
    reviews: 89,
    priceRange: {
      min: 800,
      max: 2500,
      currency: '₹'
    },
    phone: '+91 98765 12340',
    email: 'orders@spiceandflavors.com',
    website: 'spiceandflavors.com',
    hours: 'Tue-Sun: 9AM-9PM',
    description: 'Spice & Flavors Catering brings authentic Indian cuisine to your special occasions. Our expert chefs prepare traditional dishes with modern presentation, ensuring a memorable dining experience for your guests.',
    services: [
      'Wedding catering',
      'Corporate event catering',
      'Traditional thali service',
      'Live counters and food stations',
      'Custom menu planning',
      'Jain and vegetarian options',
      'Dessert counters',
      'Beverage service'
    ],
    images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff',
      'https://images.unsplash.com/photo-1535141192574-5d4897c12636',
      'https://images.unsplash.com/photo-1621303837174-89db7bccf373',
      'https://images.unsplash.com/photo-1562777717-dc81ec97d022'
    ],
    specialties: ['North Indian Cuisine', 'South Indian Cuisine', 'Street Food', 'Fusion Food'],
    availability: true,
    responseTime: '1-2 hours',
    experience: '10+ years'
  },
  {
    id: '3',
    name: 'Bollywood Beats Entertainment',
    type: 'Entertainment',
    location: 'Bangalore, Karnataka',
    address: 'Koramangala, 5th Block, Bangalore - 560095',
    rating: 4.7,
    reviews: 67,
    priceRange: {
      min: 50000,
      max: 250000,
      currency: '₹'
    },
    phone: '+91 98765 56780',
    email: 'bookings@bollywoodbeats.com',
    website: 'bollywoodbeats.com',
    hours: 'Mon-Sun: 10AM-10PM',
    description: 'Bollywood Beats Entertainment brings the magic of Indian cinema to your events. Our talented performers create unforgettable experiences with live music, dance performances, and celebrity appearances.',
    services: [
      'Live music performances',
      'Bollywood dance shows',
      'DJ services',
      'Celebrity appearances',
      'Theme-based entertainment',
      'Sound and lighting setup',
      'MC services',
      'Cultural performances'
    ],
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec'
    ],
    specialties: ['Bollywood Entertainment', 'Live Music', 'Dance Performances', 'Celebrity Management'],
    availability: true,
    responseTime: '3-4 hours',
    experience: '8+ years'
  },
  {
    id: '4',
    name: 'Eternal Moments Photography',
    type: 'Photography',
    location: 'Hyderabad, Telangana',
    address: 'Jubilee Hills, Hyderabad - 500033',
    rating: 4.9,
    reviews: 112,
    priceRange: {
      min: 75000,
      max: 350000,
      currency: '₹'
    },
    phone: '+91 98765 90120',
    email: 'contact@eternalmoments.com',
    website: 'eternalmoments.com',
    hours: 'Mon-Sun: 9AM-8PM',
    description: 'Eternal Moments Photography captures the essence of your special day with artistic precision. Our team specializes in candid photography, traditional portraits, and cinematic wedding films.',
    services: [
      'Wedding photography',
      'Pre-wedding shoots',
      'Cinematic wedding films',
      'Drone photography',
      'Photo albums and prints',
      'Photo booth services',
      'Traditional portrait sessions',
      'Event coverage'
    ],
    images: [
      'https://images.unsplash.com/photo-1511275539165-cc46b1ee89bf',
      'https://images.unsplash.com/photo-1519741497674-611481863552',
      'https://images.unsplash.com/photo-1519741497674-611481863552',
      'https://images.unsplash.com/photo-1519741497674-611481863552'
    ],
    specialties: ['Wedding Photography', 'Candid Photography', 'Cinematic Films', 'Traditional Portraits'],
    availability: true,
    responseTime: '1-2 hours',
    experience: '12+ years'
  },
  {
    id: '5',
    name: 'Mandap Decorators',
    type: 'Decor',
    location: 'Jaipur, Rajasthan',
    address: 'C-Scheme, Jaipur - 302001',
    rating: 4.8,
    reviews: 95,
    priceRange: {
      min: 100000,
      max: 800000,
      currency: '₹'
    },
    phone: '+91 98765 34567',
    email: 'info@mandapdecorators.com',
    website: 'mandapdecorators.com',
    hours: 'Mon-Sat: 9AM-7PM',
    description: 'Transforming venues into magical spaces with traditional and contemporary decor elements. Specializing in wedding mandaps, stage designs, and complete venue decoration.',
    services: [
      'Mandap design and setup',
      'Floral arrangements',
      'Theme-based decoration',
      'Lighting design',
      'Stage decoration',
      'Entry and pathway decor',
      'Seating arrangements',
      'Props and accessories'
    ],
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
    ],
    specialties: ['Traditional Mandaps', 'Modern Decor', 'Theme Weddings', 'Luxury Events'],
    availability: true,
    responseTime: '2-3 hours',
    experience: '20+ years'
  },
  {
    id: '6',
    name: 'Divine Mehendi Artists',
    type: 'Beauty',
    location: 'Ahmedabad, Gujarat',
    address: 'Satellite Road, Ahmedabad - 380015',
    rating: 4.9,
    reviews: 156,
    priceRange: {
      min: 15000,
      max: 75000,
      currency: '₹'
    },
    phone: '+91 98765 23456',
    email: 'book@divinemehendi.com',
    website: 'divinemehendi.com',
    hours: 'Mon-Sun: 10AM-8PM',
    description: 'Award-winning mehendi artists creating intricate designs for all occasions. Specializing in bridal mehendi, Arabic designs, and contemporary patterns.',
    services: [
      'Bridal mehendi',
      'Party mehendi',
      'Arabic designs',
      'Indo-western patterns',
      'Group bookings',
      'Destination wedding services',
      'Color mehendi',
      'Natural mehendi'
    ],
    images: [
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74',
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74',
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74',
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74'
    ],
    specialties: ['Bridal Mehendi', 'Arabic Designs', 'Contemporary Patterns', 'Natural Herbs'],
    availability: true,
    responseTime: '1 hour',
    experience: '15+ years'
  },
  {
    id: '7',
    name: 'Rhythm DJs',
    type: 'Entertainment',
    location: 'Pune, Maharashtra',
    address: 'Koregaon Park, Pune - 411001',
    rating: 4.7,
    reviews: 88,
    priceRange: {
      min: 35000,
      max: 150000,
      currency: '₹'
    },
    phone: '+91 98765 45678',
    email: 'bookings@rhythmdjs.com',
    website: 'rhythmdjs.com',
    hours: 'Mon-Sun: 11AM-11PM',
    description: 'Professional DJ services for all types of events. State-of-the-art sound and lighting equipment with experienced DJs who know how to keep the crowd energized.',
    services: [
      'Wedding DJ',
      'Sangeet nights',
      'Corporate events',
      'Club nights',
      'Sound system rental',
      'Lighting setup',
      'LED walls',
      'Smoke machines'
    ],
    images: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7'
    ],
    specialties: ['Wedding Music', 'Bollywood Hits', 'International Music', 'Theme Parties'],
    availability: true,
    responseTime: '2-3 hours',
    experience: '10+ years'
  },
  {
    id: '8',
    name: 'Swaad Caterers',
    type: 'Catering',
    location: 'Chennai, Tamil Nadu',
    address: 'T. Nagar, Chennai - 600017',
    rating: 4.8,
    reviews: 134,
    priceRange: {
      min: 750,
      max: 2000,
      currency: '₹'
    },
    phone: '+91 98765 67890',
    email: 'orders@swaadcaterers.com',
    website: 'swaadcaterers.com',
    hours: 'Mon-Sun: 8AM-10PM',
    description: 'Authentic South Indian cuisine with a modern twist. Specializing in traditional Tamil Nadu delicacies and contemporary fusion dishes.',
    services: [
      'Wedding catering',
      'Corporate lunches',
      'Live dosa counter',
      'Traditional banana leaf',
      'Modern fusion food',
      'Packed meals',
      'Dessert counters',
      'Tea/Coffee service'
    ],
    images: [
      'https://images.unsplash.com/photo-1555244162-803834f70033',
      'https://images.unsplash.com/photo-1555244162-803834f70033',
      'https://images.unsplash.com/photo-1555244162-803834f70033',
      'https://images.unsplash.com/photo-1555244162-803834f70033'
    ],
    specialties: ['South Indian', 'Traditional Tamil', 'Modern Fusion', 'Live Counters'],
    availability: true,
    responseTime: '1-2 hours',
    experience: '25+ years'
  },
  {
    id: '9',
    name: 'Glam Squad',
    type: 'Beauty',
    location: 'Kolkata, West Bengal',
    address: 'Park Street, Kolkata - 700016',
    rating: 4.9,
    reviews: 167,
    priceRange: {
      min: 25000,
      max: 100000,
      currency: '₹'
    },
    phone: '+91 98765 78901',
    email: 'book@glamsquad.com',
    website: 'glamsquad.com',
    hours: 'Mon-Sun: 9AM-9PM',
    description: 'Premium bridal makeup and hair styling services. Our team of experts creates stunning looks combining traditional Bengali styles with modern trends.',
    services: [
      'Bridal makeup',
      'Party makeup',
      'Hair styling',
      'Draping services',
      'Group packages',
      'Pre-wedding grooming',
      'Nail art',
      'Eyelash extensions'
    ],
    images: [
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2'
    ],
    specialties: ['Bridal Makeup', 'Bengali Styles', 'Modern Trends', 'Hair Styling'],
    availability: true,
    responseTime: '1-2 hours',
    experience: '12+ years'
  },
  {
    id: '10',
    name: 'Destination Weddings India',
    type: 'Event Planner',
    location: 'Udaipur, Rajasthan',
    address: 'Lake Palace Road, Udaipur - 313001',
    rating: 4.9,
    reviews: 78,
    priceRange: {
      min: 1000000,
      max: 5000000,
      currency: '₹'
    },
    phone: '+91 98765 89012',
    email: 'plan@destinationweddings.com',
    website: 'destinationweddings.com',
    hours: 'Mon-Sat: 10AM-6PM',
    description: 'Luxury destination wedding planners specializing in palace weddings across Rajasthan. Creating royal experiences with attention to every detail.',
    services: [
      'Venue selection',
      'Palace bookings',
      'Travel arrangements',
      'Accommodation',
      'Local tours',
      'Cultural programs',
      'Royal experiences',
      'Complete planning'
    ],
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
    ],
    specialties: ['Palace Weddings', 'Royal Experiences', 'Luxury Events', 'Heritage Venues'],
    availability: true,
    responseTime: '24 hours',
    experience: '18+ years'
  },
  {
    id: '11',
    name: 'Rangoli Events & Decor',
    type: 'Decor',
    location: 'Lucknow, Uttar Pradesh',
    address: 'Hazratganj, Lucknow - 226001',
    rating: 4.8,
    reviews: 92,
    priceRange: {
      min: 75000,
      max: 500000,
      currency: '₹'
    },
    phone: '+91 98765 11223',
    email: 'info@rangolidecor.com',
    website: 'rangolidecor.com',
    hours: 'Mon-Sun: 9AM-8PM',
    description: 'Specializing in traditional and contemporary rangoli designs, flower decorations, and innovative theme-based decor. We transform venues with intricate rangoli patterns and stunning floral arrangements.',
    services: [
      'Traditional rangoli designs',
      'Floral decorations',
      'Theme-based decor',
      'Wedding venue styling',
      'Corporate event decor',
      'Entrance designs',
      'Stage decoration',
      'Eco-friendly decor options'
    ],
    images: [
      'https://images.unsplash.com/photo-1623937228771-f9ed2dfe2011',
      'https://images.unsplash.com/photo-1623937228771-f9ed2dfe2011',
      'https://images.unsplash.com/photo-1623937228771-f9ed2dfe2011',
      'https://images.unsplash.com/photo-1623937228771-f9ed2dfe2011'
    ],
    specialties: ['Traditional Rangoli', 'Modern Decor', 'Floral Art', 'Theme Designs'],
    availability: true,
    responseTime: '2-3 hours',
    experience: '12+ years'
  },
  {
    id: '12',
    name: 'Dhol Baaje Orchestra',
    type: 'Entertainment',
    location: 'Chandigarh, Punjab',
    address: 'Sector 17, Chandigarh - 160017',
    rating: 4.9,
    reviews: 145,
    priceRange: {
      min: 45000,
      max: 200000,
      currency: '₹'
    },
    phone: '+91 98765 33445',
    email: 'book@dholbaaje.com',
    website: 'dholbaaje.com',
    hours: 'Mon-Sun: 10AM-9PM',
    description: 'Premier Punjabi folk music and dance group specializing in traditional performances. Our ensemble includes expert dhol players, singers, and bhangra dancers who bring authentic Punjab culture to your events.',
    services: [
      'Live dhol performances',
      'Bhangra dance group',
      'Folk music ensemble',
      'Wedding entry performances',
      'Sangeet night shows',
      'Traditional folk singers',
      'Giddha performances',
      'Custom choreography'
    ],
    images: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7'
    ],
    specialties: ['Punjabi Folk Music', 'Bhangra', 'Traditional Performances', 'Wedding Entertainment'],
    availability: true,
    responseTime: '1-2 hours',
    experience: '20+ years'
  },
  {
    id: '13',
    name: 'Digital Memories 360',
    type: 'Photography',
    location: 'Goa',
    address: 'Panjim, Goa - 403001',
    rating: 4.8,
    reviews: 78,
    priceRange: {
      min: 85000,
      max: 400000,
      currency: '₹'
    },
    phone: '+91 98765 55667',
    email: 'shoot@digitalmemories360.com',
    website: 'digitalmemories360.com',
    hours: 'Mon-Sat: 9AM-7PM',
    description: 'Innovative photography studio specializing in 360-degree photography, drone shots, and virtual reality wedding experiences. We capture your special moments using cutting-edge technology.',
    services: [
      '360-degree photography',
      'Drone videography',
      'Virtual reality captures',
      'Same-day edits',
      'Live streaming',
      'Photo booth with AR',
      'Traditional photography',
      'Digital albums'
    ],
    images: [
      'https://images.unsplash.com/photo-1511275539165-cc46b1ee89bf',
      'https://images.unsplash.com/photo-1511275539165-cc46b1ee89bf',
      'https://images.unsplash.com/photo-1511275539165-cc46b1ee89bf',
      'https://images.unsplash.com/photo-1511275539165-cc46b1ee89bf'
    ],
    specialties: ['360° Photography', 'Drone Shots', 'VR Experiences', 'Live Streaming'],
    availability: true,
    responseTime: '2-3 hours',
    experience: '8+ years'
  },
  {
    id: '14',
    name: 'Royal Heritage Palace',
    type: 'Venue',
    location: 'Jodhpur, Rajasthan',
    address: 'Umaid Bhawan Road, Jodhpur - 342006',
    rating: 4.9,
    reviews: 182,
    priceRange: {
      min: 1500000,
      max: 7500000,
      currency: '₹'
    },
    phone: '+91 98765 77889',
    email: 'events@royalheritagepalace.com',
    website: 'royalheritagepalace.com',
    hours: 'Mon-Sun: 10AM-6PM',
    description: 'A majestic heritage palace venue offering a royal Rajasthani experience. Our venue features stunning architecture, luxurious accommodations, and spectacular views of the Blue City.',
    services: [
      'Palace venue rental',
      'Luxury accommodation',
      'Royal dining experience',
      'Heritage tours',
      'Cultural performances',
      'Vintage car services',
      'Royal photoshoots',
      'Customized decor'
    ],
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
    ],
    specialties: ['Heritage Venue', 'Royal Weddings', 'Luxury Events', 'Cultural Experiences'],
    availability: true,
    responseTime: '24 hours',
    experience: '30+ years'
  },
  {
    id: '15',
    name: 'Vastra Designers',
    type: 'Fashion',
    location: 'Surat, Gujarat',
    address: 'Ring Road, Surat - 395002',
    rating: 4.7,
    reviews: 165,
    priceRange: {
      min: 25000,
      max: 200000,
      currency: '₹'
    },
    phone: '+91 98765 99000',
    email: 'design@vastradesigners.com',
    website: 'vastradesigners.com',
    hours: 'Mon-Sat: 11AM-8PM',
    description: 'Premium fashion design studio specializing in bridal wear, groomswear, and family occasion outfits. Our designers create personalized ensembles combining traditional craftsmanship with contemporary styles.',
    services: [
      'Bridal lehengas',
      'Groom sherwanis',
      'Family occasion wear',
      'Custom designing',
      'Style consultation',
      'Fabric selection',
      'Embroidery customization',
      'Alteration services'
    ],
    images: [
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74',
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74',
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74',
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74'
    ],
    specialties: ['Bridal Wear', 'Groom Fashion', 'Designer Wear', 'Custom Outfits'],
    availability: true,
    responseTime: '3-4 hours',
    experience: '15+ years'
  }
];

export function useVendors() {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return context;
}

export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const vendorsQuery = query(collection(db, 'vendors'));
      const querySnapshot = await getDocs(vendorsQuery);
      
      const vendorsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Vendor[];

      // Use mock data if no vendors in database
      if (vendorsData.length === 0) {
        setVendors(mockVendors);
      } else {
        setVendors(vendorsData);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error loading vendors",
        description: "There was a problem loading the vendors. Please try again.",
        variant: "destructive",
      });
      // Fallback to mock data on error
      setVendors(mockVendors);
    } finally {
      setLoading(false);
    }
  };

  const getVendor = (id: string) => {
    return vendors.find((vendor) => vendor.id === id);
  };

  const requestQuotation = async (
    vendorId: string, 
    data: Omit<QuotationRequest, 'userId' | 'status' | 'createdAt'>
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to request a quotation",
        variant: "destructive",
      });
      return false;
    }

    try {
      const quotationData: QuotationRequest = {
        ...data,
        vendorId,
        userId: user.uid,
        status: 'pending',
        createdAt: Timestamp.now(),
      };

      const quotationsRef = collection(db, 'quotations');
      await addDoc(quotationsRef, quotationData);

      toast({
        title: "Success",
        description: "Quotation request sent successfully",
      });

      return true;
    } catch (err) {
      console.error('Error requesting quotation:', err);
      toast({
        title: "Error",
        description: "Failed to send quotation request",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <VendorContext.Provider 
      value={{ 
        vendors, 
        getVendor,
        loading,
        refreshVendors: fetchVendors,
        requestQuotation
      }}
    >
      {children}
    </VendorContext.Provider>
  );
}; 