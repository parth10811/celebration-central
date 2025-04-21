import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { EventProvider } from "@/context/EventContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { VendorProvider } from "@/context/VendorContext";
import { SlideUp } from "@/components/ui/slide-up";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import CreateEvent from "./pages/CreateEvent";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import Vendors from "./pages/Vendors";
import VendorDetails from "./pages/VendorDetails";
import Inspiration from "./pages/Inspiration";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Help from "./pages/Help";
import EditEvent from "./pages/EditEvent";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <SlideUp>
            <Index />
          </SlideUp>
        } />
        <Route path="/login" element={
          <SlideUp>
            <Login />
          </SlideUp>
        } />
        <Route path="/signup" element={
          <SlideUp>
            <SignUp />
          </SlideUp>
        } />
        <Route path="/forgot-password" element={
          <SlideUp>
            <ForgotPassword />
          </SlideUp>
        } />
        <Route path="/create-event" element={
          <ProtectedRoute>
            <SlideUp>
              <CreateEvent />
            </SlideUp>
          </ProtectedRoute>
        } />
        <Route path="/edit-event/:id" element={
          <ProtectedRoute>
            <SlideUp>
              <EditEvent />
            </SlideUp>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SlideUp>
              <Dashboard />
            </SlideUp>
          </ProtectedRoute>
        } />
        <Route path="/events" element={
          <SlideUp>
            <Events />
          </SlideUp>
        } />
        <Route path="/event/:id" element={
          <SlideUp>
            <EventDetails />
          </SlideUp>
        } />
        <Route path="/vendors" element={
          <SlideUp>
            <Vendors />
          </SlideUp>
        } />
        <Route path="/vendor/:id" element={
          <SlideUp>
            <VendorDetails />
          </SlideUp>
        } />
        <Route path="/inspiration" element={
          <SlideUp>
            <Inspiration />
          </SlideUp>
        } />
        <Route path="/ai-assistant" element={
          <ProtectedRoute>
            <SlideUp>
              <AIAssistant />
            </SlideUp>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SlideUp>
              <Settings />
            </SlideUp>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <SlideUp>
              <UserProfile />
            </SlideUp>
          </ProtectedRoute>
        } />
        <Route path="/about" element={
          <SlideUp>
            <About />
          </SlideUp>
        } />
        <Route path="/contact" element={
          <SlideUp>
            <Contact />
          </SlideUp>
        } />
        <Route path="/blog" element={
          <SlideUp>
            <Blog />
          </SlideUp>
        } />
        <Route path="/terms" element={
          <SlideUp>
            <Terms />
          </SlideUp>
        } />
        <Route path="/privacy" element={
          <SlideUp>
            <Privacy />
          </SlideUp>
        } />
        <Route path="/help" element={
          <SlideUp>
            <Help />
          </SlideUp>
        } />
        <Route path="*" element={
          <SlideUp>
            <NotFound />
          </SlideUp>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <AuthProvider>
          <EventProvider>
            <VendorProvider>
              <ErrorBoundary>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AnimatedRoutes />
                </BrowserRouter>
              </ErrorBoundary>
            </VendorProvider>
          </EventProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
