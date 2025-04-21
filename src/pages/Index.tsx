import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarCheck, MessageSquareText, Sparkles, Clock, Users, Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FeatureCard from '@/components/home/FeatureCard';
import EventTypeCard from '@/components/home/EventTypeCard';
import { FadeIn } from '@/components/ui/fade-in';
import { SlideUp } from '@/components/ui/slide-up';

const Index = () => {
  return (
    <>
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="hero-gradient py-16 md:py-28 px-6">
          <div className="container mx-auto text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto">
                Create Unforgettable Events with <span className="gradient-text">AI-Powered</span> Planning
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                From weddings to birthdays, use AI to design, plan, and manage every detail of your perfect event.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/create-event">
                  <Button size="lg" className="px-8">
                    Create an Event
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
                <Link to="/inspiration">
                  <Button size="lg" variant="outline" className="px-8">
                    Get AI Inspiration
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
        
        {/* Event Types Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <SlideUp>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Plan Any Celebration</h2>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                Choose from a variety of event types and get personalized planning assistance
              </p>
            </SlideUp>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Wedding", icon: "💍", description: "Plan your perfect wedding day with AI assistance for venues, themes, and vendors.", bgClass: "bg-accent/80" },
                { title: "Birthday", icon: "🎂", description: "Create memorable birthday celebrations with themed suggestions and party ideas.", bgClass: "bg-blue-50" },
                { title: "Corporate", icon: "🏢", description: "Organize professional events, conferences, and team-building activities.", bgClass: "bg-amber-50" },
                { title: "Baby Shower", icon: "👶", description: "Plan a beautiful celebration for the upcoming arrival of a little one.", bgClass: "bg-pink-50" },
                { title: "Graduation", icon: "🎓", description: "Celebrate academic achievements with personalized graduation events.", bgClass: "bg-green-50" },
                { title: "House Party", icon: "🏠", description: "Host the perfect house party with themed decoration and entertainment ideas.", bgClass: "bg-purple-50" }
              ].map((event, index) => (
                <SlideUp key={event.title} delay={0.1 * index}>
                  <EventTypeCard 
                    title={event.title}
                    icon={event.icon}
                    description={event.description}
                    bgClass={event.bgClass}
                  />
                </SlideUp>
              ))}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-accent/50 px-6">
          <div className="container mx-auto">
            <SlideUp>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Powerful Planning Tools</h2>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                Everything you need to create and manage exceptional events, powered by AI
              </p>
            </SlideUp>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "AI Event Suggestions", description: "Get personalized recommendations for themes, decor, and activities based on your preferences.", icon: Sparkles },
                { title: "Guest Management", description: "Easily manage guest lists, send invitations, and track RSVPs all in one place.", icon: Users },
                { title: "Vendor Booking", description: "Find and book trusted vendors for catering, venues, entertainment, and more.", icon: Search },
                { title: "Timeline Planning", description: "Create detailed event timelines and schedules to keep everything on track.", icon: Clock },
                { title: "Smart Checklists", description: "Stay organized with AI-generated checklists tailored to your specific event.", icon: CalendarCheck },
                { title: "Vendor Messaging", description: "Communicate directly with vendors through our integrated messaging system.", icon: MessageSquareText }
              ].map((feature, index) => (
                <SlideUp key={feature.title} delay={0.1 * index}>
                  <FeatureCard
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                  />
                </SlideUp>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <SlideUp>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Planning?</h2>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Create your first event today and discover how AI can make event planning easier and more enjoyable.
              </p>
            </SlideUp>
            <SlideUp delay={0.4}>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" className="px-8">
                    Sign Up Free
                  </Button>
                </Link>
                <Link to="/events">
                  <Button size="lg" variant="outline" className="px-8">
                    Browse Events
                  </Button>
                </Link>
              </div>
            </SlideUp>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default Index;
