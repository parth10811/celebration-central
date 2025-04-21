import { render, screen, act } from '@testing-library/react';
import { EventProvider, useEvents } from '@/context/EventContext';
import { AuthProvider } from '@/context/AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock child component to test the context
const TestComponent = () => {
  const { events, loading, addEvent, getEvent, updateEvent, deleteEvent, error } = useEvents();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="events-count">{events.length}</div>
      <div data-testid="error">{error}</div>
      <button 
        onClick={() => addEvent({
          title: 'Test Event',
          date: new Date().toISOString(),
          location: 'Test Location',
          description: 'Test Description',
          type: 'test',
          guests: 10,
          budget: 1000,
          contact: {
            phone: '1234567890',
            email: 'test@example.com'
          }
        })}
      >
        Add Event
      </button>
      <button 
        onClick={() => getEvent('test-event-id')}
      >
        Get Event
      </button>
      <button 
        onClick={() => updateEvent('test-event-id', {
          title: 'Updated Event',
          date: new Date().toISOString(),
          location: 'Updated Location',
          description: 'Updated Description',
          type: 'test',
          guests: 20,
          budget: 2000,
          contact: {
            phone: '1234567890',
            email: 'test@example.com'
          }
        })}
      >
        Update Event
      </button>
      <button 
        onClick={() => deleteEvent('test-event-id')}
      >
        Delete Event
      </button>
    </div>
  );
};

describe('EventContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide event context', () => {
    render(
      <AuthProvider>
        <EventProvider>
          <TestComponent />
        </EventProvider>
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
  });

  it('should add an event', async () => {
    const mockAddDoc = vi.fn().mockResolvedValue({ id: 'test-event-id' });
    vi.mocked(addDoc).mockImplementation(mockAddDoc);

    render(
      <AuthProvider>
        <EventProvider>
          <TestComponent />
        </EventProvider>
      </AuthProvider>
    );

    const addButton = screen.getByText('Add Event');
    await act(async () => {
      addButton.click();
    });

    expect(mockAddDoc).toHaveBeenCalled();
  });

  it('should handle add event error', async () => {
    const mockAddDoc = vi.fn().mockRejectedValue(new Error('Failed to add event'));
    vi.mocked(addDoc).mockImplementation(mockAddDoc);

    render(
      <AuthProvider>
        <EventProvider>
          <TestComponent />
        </EventProvider>
      </AuthProvider>
    );

    const addButton = screen.getByText('Add Event');
    await act(async () => {
      addButton.click();
    });

    expect(screen.getByTestId('error')).toHaveTextContent('Failed to add event');
  });

  it('should get an event', async () => {
    const mockEvent = {
      id: 'test-event-id',
      title: 'Test Event',
      date: new Date().toISOString(),
      location: 'Test Location',
      description: 'Test Description',
      type: 'test',
      guests: 10,
      budget: 1000,
      contact: {
        phone: '1234567890',
        email: 'test@example.com'
      }
    };
    
    const mockGetDoc = vi.fn().mockResolvedValue({
      exists: () => true,
      data: () => mockEvent
    });
    
    vi.mocked(getDoc).mockImplementation(mockGetDoc);

    render(
      <AuthProvider>
        <EventProvider>
          <TestComponent />
        </EventProvider>
      </AuthProvider>
    );

    const getButton = screen.getByText('Get Event');
    await act(async () => {
      getButton.click();
    });

    expect(mockGetDoc).toHaveBeenCalled();
  });

  it('should handle get event error', async () => {
    const mockGetDoc = vi.fn().mockRejectedValue(new Error('Failed to get event'));
    vi.mocked(getDoc).mockImplementation(mockGetDoc);

    render(
      <AuthProvider>
        <EventProvider>
          <TestComponent />
        </EventProvider>
      </AuthProvider>
    );

    const getButton = screen.getByText('Get Event');
    await act(async () => {
      getButton.click();
    });

    expect(screen.getByTestId('error')).toHaveTextContent('Failed to get event');
  });

  it('should update an event', async () => {
    const mockUpdateDoc = vi.fn().mockResolvedValue(undefined);
    vi.mocked(updateDoc).mockImplementation(mockUpdateDoc);

    render(
      <AuthProvider>
        <EventProvider>
          <TestComponent />
        </EventProvider>
      </AuthProvider>
    );

    const updateButton = screen.getByText('Update Event');
    await act(async () => {
      updateButton.click();
    });

    expect(mockUpdateDoc).toHaveBeenCalled();
  });

  it('should handle update event error', async () => {
    const mockUpdateDoc = vi.fn().mockRejectedValue(new Error('Failed to update event'));
    vi.mocked(updateDoc).mockImplementation(mockUpdateDoc);

    render(
      <AuthProvider>
        <EventProvider>
          <TestComponent />
        </EventProvider>
      </AuthProvider>
    );

    const updateButton = screen.getByText('Update Event');
    await act(async () => {
      updateButton.click();
    });

    expect(screen.getByTestId('error')).toHaveTextContent('Failed to update event');
  });

  it('should delete an event', async () => {
    const mockDeleteDoc = vi.fn().mockResolvedValue(undefined);
    vi.mocked(deleteDoc).mockImplementation(mockDeleteDoc);

    render(
      <AuthProvider>
        <EventProvider>
          <TestComponent />
        </EventProvider>
      </AuthProvider>
    );

    const deleteButton = screen.getByText('Delete Event');
    await act(async () => {
      deleteButton.click();
    });

    expect(mockDeleteDoc).toHaveBeenCalled();
  });

  it('should handle delete event error', async () => {
    const mockDeleteDoc = vi.fn().mockRejectedValue(new Error('Failed to delete event'));
    vi.mocked(deleteDoc).mockImplementation(mockDeleteDoc);

    render(
      <AuthProvider>
        <EventProvider>
          <TestComponent />
        </EventProvider>
      </AuthProvider>
    );

    const deleteButton = screen.getByText('Delete Event');
    await act(async () => {
      deleteButton.click();
    });

    expect(screen.getByTestId('error')).toHaveTextContent('Failed to delete event');
  });
}); 