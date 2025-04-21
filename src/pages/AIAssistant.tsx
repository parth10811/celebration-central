import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Send, Bot, MessageCircle, Loader2, Stars, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAIEventSuggestions } from '@/lib/openai';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FadeIn } from '@/components/ui/fade-in';
import { SlideUp } from '@/components/ui/slide-up';

const AIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Event details state
  const [eventDetails, setEventDetails] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    location: '',
    guests: 50,
    budget: undefined as number | undefined,
    preferences: '',
    type: 'birthday'
  });
  
  const handleChange = (field: string, value: string | number) => {
    setEventDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For chat tab, use the prompt directly
    if (!prompt.trim() && !eventDetails.title) return;
    
    setLoading(true);
    
    try {
      // Generate suggestions using the actual OpenAI implementation
      let result;
      
      if (prompt.trim()) {
        // For free-form prompts in the chat tab
        result = await generateAIEventSuggestions('custom', {
          title: prompt,
          date: format(new Date(), 'yyyy-MM-dd'),
          location: 'Not specified',
          guests: 50,
          preferences: prompt
        });
      } else {
        // For structured templates tab
        result = await generateAIEventSuggestions(eventDetails.type, {
          title: eventDetails.title,
          date: eventDetails.date,
          location: eventDetails.location,
          guests: eventDetails.guests,
          budget: eventDetails.budget,
          preferences: eventDetails.preferences
        });
      }
      
      setResponse(result);
      toast({
        title: "AI Response Generated",
        description: "Check out the suggestions for your event!",
      });
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    "Suggest decoration ideas for a garden wedding",
    "Give me a checklist for a corporate conference",
    "Help me plan a menu for a birthday party",
    "What entertainment works best for a family reunion?",
  ];

  const eventTypes = [
    { value: 'birthday', label: 'Birthday Party' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate Event' },
    { value: 'reunion', label: 'Family Reunion' },
    { value: 'holiday', label: 'Holiday Celebration' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[40vh] w-[40vh] bg-primary/20 rounded-full blur-[100px] animate-pulse-soft" />
        </div>
        
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary animate-float" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 slide-in-bottom">AI Event Assistant</h1>
            <p className="text-muted-foreground max-w-xl slide-in-bottom delay-100">
              Get personalized event planning assistance and creative ideas with our AI-powered tool
            </p>
          </div>
          
          <Card className="border-2 slide-in-bottom delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Event Planning Assistant
              </CardTitle>
              <CardDescription>
                Describe your event or ask for specific suggestions to get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chat">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Event Builder
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <Textarea 
                          placeholder="Describe your event or ask for specific planning advice..." 
                          className="min-h-[120px] resize-y"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Try asking about:</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {examplePrompts.map((examplePrompt, index) => (
                            <Button 
                              key={index} 
                              variant="outline" 
                              size="sm"
                              type="button"
                              onClick={() => setPrompt(examplePrompt)}
                              disabled={loading}
                              className="text-xs"
                            >
                              {examplePrompt}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full flex items-center gap-2"
                        disabled={loading || !prompt.trim()}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Get Suggestions
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="templates">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="event-type">Event Type</Label>
                        <Select
                          value={eventDetails.type}
                          onValueChange={(value) => handleChange('type', value)}
                          disabled={loading}
                        >
                          <SelectTrigger id="event-type">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="event-title">Event Title</Label>
                        <Input
                          id="event-title"
                          placeholder="My Amazing Event"
                          value={eventDetails.title}
                          onChange={(e) => handleChange('title', e.target.value)}
                          disabled={loading}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="event-date">Event Date</Label>
                        <Input
                          id="event-date"
                          type="date"
                          value={eventDetails.date}
                          onChange={(e) => handleChange('date', e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="event-location">Location</Label>
                        <Input
                          id="event-location"
                          placeholder="Event Venue"
                          value={eventDetails.location}
                          onChange={(e) => handleChange('location', e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="event-guests">Number of Guests</Label>
                        <Input
                          id="event-guests"
                          type="number"
                          min="1"
                          value={eventDetails.guests}
                          onChange={(e) => handleChange('guests', parseInt(e.target.value))}
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="event-budget">Budget (Optional)</Label>
                        <Input
                          id="event-budget"
                          type="number"
                          min="0"
                          placeholder="Optional"
                          value={eventDetails.budget || ''}
                          onChange={(e) => handleChange('budget', e.target.value ? parseInt(e.target.value) : undefined)}
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="event-preferences">Special Preferences</Label>
                        <Textarea
                          id="event-preferences"
                          placeholder="Any specific theme, dietary requirements, or other preferences..."
                          value={eventDetails.preferences}
                          onChange={(e) => handleChange('preferences', e.target.value)}
                          disabled={loading}
                          className="resize-y min-h-[100px]"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full flex items-center gap-2"
                      disabled={loading || !eventDetails.title}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating Event Plan...
                        </>
                      ) : (
                        <>
                          <Stars className="h-4 w-4" />
                          Generate Event Plan
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              {response && !loading && (
                <SlideUp className="mt-6">
                  <div className="p-4 bg-accent/50 rounded-lg border">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Suggestions
                    </p>
                    <div className="whitespace-pre-line text-sm">
                      {response}
                    </div>
                  </div>
                </SlideUp>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default AIAssistant;
