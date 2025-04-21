import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmail, logoutUser, db } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '@/context/AuthContext';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { LockIcon, UserIcon } from 'lucide-react';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showLoginForm, setShowLoginForm] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verify admin credentials if attempting admin login
      if (isAdmin && (email !== 'admin@gmail.com' || password !== 'admin123')) {
        toast({
          title: "Access Denied",
          description: "Invalid administrator credentials.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const result = await signInWithEmail(email, password);
      
      // Create or update user document with appropriate role
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        role: isAdmin ? 'admin' : 'customer',
        createdAt: new Date().toISOString()
      });

      toast({
        title: isAdmin ? "Welcome Administrator" : "Welcome back!",
        description: "Login successful",
      });
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Failed to log in. Please try again.";
      
      if (error instanceof FirebaseError) {
        switch(error.code) {
          case 'auth/user-not-found':
            errorMessage = "No account found with this email.";
            break;
          case 'auth/wrong-password':
            errorMessage = "Incorrect password.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Invalid email address format.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Too many attempts. Please try again later.";
            break;
        }
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const SelectionScreen = () => (
    <Card className="w-full max-w-md border-2 shadow-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-display font-bold">Welcome to Celebration Central</CardTitle>
        <CardDescription className="text-muted-foreground">
          Choose your login type to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => {
            setIsAdmin(false);
            setShowLoginForm(true);
          }}
          className="w-full h-24 text-lg flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90"
        >
          <UserIcon className="w-8 h-8" />
          <span>Customer Login</span>
          <span className="text-sm font-normal opacity-80">Access your events and bookings</span>
        </Button>

        <Button
          onClick={() => {
            setIsAdmin(true);
            setShowLoginForm(true);
          }}
          className="w-full h-24 text-lg flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          <LockIcon className="w-8 h-8" />
          <span>Admin Login</span>
          <span className="text-sm font-normal opacity-80">Access the admin dashboard</span>
        </Button>
      </CardContent>
    </Card>
  );

  const LoginForm = () => (
    <Card className={`w-full max-w-md border-2 ${isAdmin ? 'border-purple-500' : 'shadow-md'}`}>
      <CardHeader className={`space-y-1 text-center ${isAdmin ? 'bg-purple-100 rounded-t-lg' : ''}`}>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowLoginForm(false)}
            className="hover:bg-background"
          >
            {isAdmin ? <LockIcon className="w-5 h-5 text-purple-500" /> : <UserIcon className="w-5 h-5" />}
          </Button>
          <CardTitle className={`text-3xl font-display font-bold ${isAdmin ? 'text-purple-700' : ''}`}>
            {isAdmin ? 'Administrator Access' : 'Welcome back'}
          </CardTitle>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
        <CardDescription className="text-muted-foreground">
          {isAdmin ? 'Secure login for administrators only' : 'Sign in to your customer account'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input 
              type="email" 
              placeholder={isAdmin ? "admin@gmail.com" : "Enter your email"}
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={isAdmin ? 'border-purple-300' : ''}
            />
          </div>
          <div className="space-y-2">
            <Input 
              type="password" 
              placeholder="Enter your password"
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={isAdmin ? 'border-purple-300' : ''}
            />
          </div>
          <Button 
            type="submit" 
            className={`w-full ${isAdmin ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : isAdmin ? "Access Admin Panel" : "Sign In"}
          </Button>
        </form>
        
        <div className="mt-6 text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="hover:text-primary">
              Sign up
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      {showLoginForm ? <LoginForm /> : <SelectionScreen />}
    </main>
  );
};

export default Login;
