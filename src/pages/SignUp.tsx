import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { signUpWithEmail, signInWithGoogle, db } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const SignUp = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [role, setRole] = React.useState<'customer' | 'admin'>('customer');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if this is an admin signup
      const isAdmin = email === 'admin@gmail.com' && password === 'admin123';

      // Create the user account
      const result = await signUpWithEmail(email, password);

      // Create the user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        role: isAdmin ? 'admin' : 'customer',
        createdAt: new Date().toISOString()
      });

      toast({
        title: isAdmin ? "Admin Account Created" : "Account Created",
        description: "You can now log in",
      });

      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error instanceof FirebaseError) {
        switch(error.code) {
          case 'auth/email-already-in-use':
            errorMessage = "This email is already registered.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Invalid email address format.";
            break;
          case 'auth/operation-not-allowed':
            errorMessage = "Email/password accounts are not enabled.";
            break;
          case 'auth/weak-password':
            errorMessage = "Password is too weak.";
            break;
        }
      }
      
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      console.log('Attempting to sign up with Google...');
      const result = await signInWithGoogle();
      console.log("Google sign up successful:", result.user.uid);

      // Create user document with customer role for Google sign-up
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        role: 'customer', // Google sign-up is always customer
        createdAt: new Date().toISOString()
      });

      toast({
        title: "Welcome!",
        description: "Your account has been created successfully.",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Google sign up error:", error);
      let errorMessage = "Failed to create account with Google. Please try again.";
      
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = "Google sign-up was cancelled.";
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = "Network error. Please check your connection.";
        }
      }
      
      toast({
        title: "Google Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <Card className="border-2 shadow-md">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-display font-bold">Create an account</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your email and password to sign up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign up"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button variant="outline" onClick={handleGoogleSignUp} disabled={isLoading} className="w-full">
                Continue with Google
              </Button>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground text-center w-full">
                Already have an account?{' '}
                <Link to="/login" className="hover:text-primary">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default SignUp;
