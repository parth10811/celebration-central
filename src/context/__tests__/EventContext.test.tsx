import { render, screen, waitFor } from '@testing-library/react';
import { EventProvider, useEvents } from '../EventContext';
import { AuthContext } from '../AuthContext';
import { User } from 'firebase/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getDocs: jest.fn(),
    doc: jest.fn().mockReturnThis(),
    getDoc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
  },
  auth: {
    currentUser: null,
  },
}));

// Mock user data
const mockUser: User = {
  uid: 'test-uid',
  email: 'test@example.com',
} as User;

const mockUserData = {
  role: 'customer' as const,
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
};

const mockAuthValue = {
  user: mockUser,
  userData: mockUserData,
  loading: false,
};

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Test component that uses useEvents
const TestComponent = () => {
  const { 
    events, 
    loading, 
    addEvent, 
    updateEvent, 
    deleteEvent,
    getEventById,
    getEventsByUserId,
    getEventsByType,
    getEventsByStatus
  } = useEvents();

  const handleAddEvent = () => {
    addEvent({
      title: 'Test Event',
      description: 'Test Description',
      date: new Date().toISOString(),
      budget: 5000,
      type: 'wedding',
      status: 'pending',
      userId: mockUser.uid,
    });
  };

  const handleUpdateEvent = (eventId: string) => {
    updateEvent(eventId, {
      title: 'Updated Event',
      description: 'Updated Description',
      budget: 10000,
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
  };

  return (
    <div>
      <div data-testid="loading-state">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="events-count">{events.length}</div>
      <button data-testid="add-event" onClick={handleAddEvent}>Add Event</button>
      <button data-testid="update-event" onClick={() => handleUpdateEvent('test-event-id')}>Update Event</button>
      <button data-testid="delete-event" onClick={() => handleDeleteEvent('test-event-id')}>Delete Event</button>
      <div data-testid="event-details">
        {events.map(event => (
          <div key={event.id} data-testid={`event-${event.id}`}>
            <span data-testid={`event-title-${event.id}`}>{event.title}</span>
            <span data-testid={`event-type-${event.id}`}>{event.type}</span>
            <span data-testid={`event-status-${event.id}`}>{event.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Wrapper component to provide necessary providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const testQueryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={testQueryClient}>
      <AuthContext.Provider value={mockAuthValue}>
        <EventProvider>
          {children}
        </EventProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe('EventProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty events', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('events-count')).toHaveTextContent('0');
  });

  it('handles loading state correctly', async () => {
    const { db } = require('@/lib/firebase');
    db.collection().where().getDocs.mockImplementation(() => 
      new Promise((resolve) => setTimeout(() => resolve({ docs: [] }), 100))
    );

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
  });

  it('handles error state gracefully', async () => {
    const { db } = require('@/lib/firebase');
    db.collection().where().getDocs.mockRejectedValue(new Error('Test error'));

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
  });

  it('adds an event successfully', async () => {
    const { db } = require('@/lib/firebase');
    const mockDocRef = { id: 'test-event-id' };
    db.addDoc.mockResolvedValue(mockDocRef);

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const addButton = screen.getByTestId('add-event');
    addButton.click();

    await waitFor(() => {
      expect(db.addDoc).toHaveBeenCalled();
    });
  });

  it('updates an event successfully', async () => {
    const { db } = require('@/lib/firebase');
    db.updateDoc.mockResolvedValue({});

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const updateButton = screen.getByTestId('update-event');
    updateButton.click();

    await waitFor(() => {
      expect(db.updateDoc).toHaveBeenCalled();
    });
  });

  it('deletes an event successfully', async () => {
    const { db } = require('@/lib/firebase');
    db.deleteDoc.mockResolvedValue({});

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const deleteButton = screen.getByTestId('delete-event');
    deleteButton.click();

    await waitFor(() => {
      expect(db.deleteDoc).toHaveBeenCalled();
    });
  });

  it('filters events by type correctly', async () => {
    const { db } = require('@/lib/firebase');
    const mockEvents = [
      { id: '1', type: 'wedding', title: 'Wedding Event' },
      { id: '2', type: 'birthday', title: 'Birthday Event' },
    ];
    db.collection().where().getDocs.mockResolvedValue({
      docs: mockEvents.map(event => ({
        id: event.id,
        data: () => event
      }))
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('event-type-1')).toHaveTextContent('wedding');
      expect(screen.getByTestId('event-type-2')).toHaveTextContent('birthday');
    });
  });

  it('handles role-based access control', async () => {
    const { db } = require('@/lib/firebase');
    const adminUser = {
      ...mockUser,
      uid: 'admin-uid'
    };
    const adminUserData = {
      ...mockUserData,
      role: 'admin' as const
    };

    const adminAuthValue = {
      user: adminUser,
      userData: adminUserData,
      loading: false,
    };

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <AuthContext.Provider value={adminAuthValue}>
          <EventProvider>
            <TestComponent />
          </EventProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(db.collection).toHaveBeenCalled();
    });
  });
}); 