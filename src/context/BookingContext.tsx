import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, query, getDocs, doc, updateDoc, where, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/types';
import { useAuth } from './AuthContext';

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  signContract: (id: string, contractUrl: string) => Promise<void>;
  getVendorBookings: (vendorId: string) => Promise<Booking[]>;
  getCustomerBookings: (customerId: string) => Promise<Booking[]>;
  getEventBookings: (eventId: string) => Promise<Booking[]>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}

export const BookingProvider = ({ children }: { children: React.ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { userData } = useAuth();

  // Fetch bookings based on user role
  useEffect(() => {
    const fetchBookings = async () => {
      if (!auth.currentUser || !userData) return;

      try {
        setLoading(true);
        let bookingsQuery;

        if (userData.role === 'vendor') {
          bookingsQuery = query(
            collection(db, 'bookings'),
            where('vendorId', '==', auth.currentUser.uid),
            orderBy('createdAt', 'desc')
          );
        } else if (userData.role === 'customer') {
          bookingsQuery = query(
            collection(db, 'bookings'),
            where('customerId', '==', auth.currentUser.uid),
            orderBy('createdAt', 'desc')
          );
        } else {
          bookingsQuery = query(
            collection(db, 'bookings'),
            orderBy('createdAt', 'desc')
          );
        }

        const snapshot = await getDocs(bookingsQuery);
        const bookingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Booking[];

        setBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userData]);

  const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      const bookingData = {
        ...booking,
        createdAt: now,
        updatedAt: now,
        status: 'pending',
        contractSigned: false
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      
      toast({
        title: 'Booking Created',
        description: 'Your booking request has been sent to the vendor.',
      });

      return docRef.id;
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      setLoading(true);
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, {
        status,
        updatedAt: new Date().toISOString()
      });

      setBookings(prev => prev.map(booking => 
        booking.id === id ? { ...booking, status } : booking
      ));

      toast({
        title: 'Booking Updated',
        description: `Booking status has been updated to ${status}.`,
      });
    } catch (err) {
      console.error('Error updating booking:', err);
      setError('Failed to update booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signContract = async (id: string, contractUrl: string) => {
    try {
      setLoading(true);
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, {
        contractSigned: true,
        contractUrl,
        updatedAt: new Date().toISOString()
      });

      setBookings(prev => prev.map(booking => 
        booking.id === id ? { ...booking, contractSigned: true, contractUrl } : booking
      ));

      toast({
        title: 'Contract Signed',
        description: 'The contract has been signed and uploaded successfully.',
      });
    } catch (err) {
      console.error('Error signing contract:', err);
      setError('Failed to sign contract');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getVendorBookings = async (vendorId: string) => {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('vendorId', '==', vendorId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(bookingsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
    } catch (err) {
      console.error('Error fetching vendor bookings:', err);
      throw err;
    }
  };

  const getCustomerBookings = async (customerId: string) => {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(bookingsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
    } catch (err) {
      console.error('Error fetching customer bookings:', err);
      throw err;
    }
  };

  const getEventBookings = async (eventId: string) => {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('eventId', '==', eventId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(bookingsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
    } catch (err) {
      console.error('Error fetching event bookings:', err);
      throw err;
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        error,
        createBooking,
        updateBookingStatus,
        signContract,
        getVendorBookings,
        getCustomerBookings,
        getEventBookings
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}; 