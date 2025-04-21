import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock child component to test the context
const TestComponent = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? 'Logged In' : 'Not Logged In'}</div>
      <button 
        onClick={() => signIn('test@example.com', 'password')}
      >
        Sign In
      </button>
      <button 
        onClick={() => signUp('test@example.com', 'password', 'customer')}
      >
        Sign Up
      </button>
      <button 
        onClick={() => signOut()}
      >
        Sign Out
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide auth context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
  });

  it('should handle sign in', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ user: { uid: 'test-uid' } });
    vi.mocked(signInWithEmailAndPassword).mockImplementation(mockSignIn);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In');
    await act(async () => {
      signInButton.click();
    });

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should handle sign up', async () => {
    const mockSignUp = vi.fn().mockResolvedValue({ user: { uid: 'test-uid' } });
    vi.mocked(createUserWithEmailAndPassword).mockImplementation(mockSignUp);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signUpButton = screen.getByText('Sign Up');
    await act(async () => {
      signUpButton.click();
    });

    expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should handle sign out', async () => {
    const mockSignOut = vi.fn().mockResolvedValue(undefined);
    vi.mocked(signOut).mockImplementation(mockSignOut);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signOutButton = screen.getByText('Sign Out');
    await act(async () => {
      signOutButton.click();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });
}); 