import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Star, Phone, Mail, Globe, Clock, ArrowLeft, Check, Share2, Heart, MessageSquare, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useVendors } from '@/context/VendorContext';
import { Skeleton } from '@/components/ui/skeleton';
import { QuotationDialog } from "@/components/QuotationDialog";
import { OptimizedImage } from "@/components/ui/optimized-image";

const VendorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { getVendor, loading } = useVendors();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isQuotationDialogOpen, setIsQuotationDialogOpen] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      if (!id) return;
      try {
        const vendorData = await getVendor(id);
        if (!vendorData) {
          toast({
            title: "Error",
            description: "Vendor not found",
            variant: "destructive",
          });
          navigate('/vendors');
          return;
        }
        setVendor(vendorData);
      } catch (error) {
        console.error('Error fetching vendor:', error);
        toast({
          title: "Error",
          description: "Failed to load vendor details",
          variant: "destructive",
        });
      }
    };
    fetchVendor();
  }, [id, getVendor, navigate, toast]);

  const handleRequestQuote = () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to request a quotation",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    setIsQuotationDialogOpen(true);
  };

  const handleBook = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to book vendors.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    navigate('/create-event', { state: { selectedVendor: vendor?.id }});
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <Skeleton className="h-10 w-32 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Skeleton className="col-span-2 row-span-2 h-96" />
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  if (!vendor) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-24 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-2xl font-semibold mb-4">Vendor Not Found</h1>
            <p className="mb-6">The vendor you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/vendors')}>
              Browse All Vendors
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/vendors')}
            className="mb-6 hover:bg-background"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="col-span-2 row-span-2">
                  <OptimizedImage 
                    src={vendor.images[0]} 
                    alt={vendor.name} 
                    className="h-full w-full object-cover rounded-lg"
                    priority
                  />
                </div>
                {vendor.images.slice(1, 4).map((image, index) => (
                  <div key={index} className="overflow-hidden rounded-lg">
                    <OptimizedImage 
                      src={image} 
                      alt={`${vendor.name} ${index + 1}`}
                      className="h-40 w-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
              
              {/* Vendor Info */}
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-accent/50">
                      {vendor.type}
                    </Badge>
                    <h1 className="text-3xl font-display font-bold">{vendor.name}</h1>
                    <div className="flex items-center mt-2 text-muted-foreground">
                      <MapPin size={16} className="mr-1" />
                      {vendor.location}
                      <span className="mx-2">•</span>
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 font-medium">{vendor.rating}</span>
                        <span className="ml-1">({vendor.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      toast({
                        title: "Vendor saved",
                        description: "Added to your favorites"
                      });
                    }}>
                      <Heart size={16} className="mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "Link copied",
                        description: "Vendor link copied to clipboard"
                      });
                    }}>
                      <Share2 size={16} className="mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Tabs */}
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="w-full justify-start mb-6">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="faqs">FAQs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">About {vendor.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>{vendor.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Address</p>
                            <p className="text-muted-foreground">{vendor.address}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Phone</p>
                            <p className="text-muted-foreground">{vendor.phone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-muted-foreground">{vendor.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Globe className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Website</p>
                            <a 
                              href={`https://${vendor.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {vendor.website}
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Business Hours</p>
                            <p className="text-muted-foreground">{vendor.hours}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="services" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vendor.services.map((service, index) => (
                          <div key={index} className="flex items-center">
                            <Check className="h-5 w-5 mr-3 text-primary" />
                            <span>{service}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="reviews" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Reviews coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="faqs" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">FAQs coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span className="font-medium">{vendor.price}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-medium">{vendor.rating}</span>
                      <span className="text-muted-foreground ml-1">({vendor.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-6">
                    <Button onClick={handleRequestQuote}>
                      Request Quote
                    </Button>
                    <Button variant="outline" onClick={handleBook}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {vendor.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <QuotationDialog 
        open={isQuotationDialogOpen} 
        onOpenChange={setIsQuotationDialogOpen}
        vendorId={vendor.id}
        vendorName={vendor.name}
      />
    </>
  );
};

export default VendorDetails;
