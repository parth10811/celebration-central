import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Calendar, ArrowUpRight, Loader2, Phone, Mail, Clock, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVendors } from '@/context/VendorContext';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OptimizedImage } from "@/components/ui/optimized-image";

const Vendors = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedEvent, setSelectedEvent] = React.useState<string>('');
  const { vendors, loading, requestQuotation } = useVendors();
  const { currentUser } = useAuth();
  const { events } = useEvents();

  // Format price to Indian currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter vendors based on search term and type
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || vendor.type.toLowerCase() === selectedType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen py-24 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Find Vendors</h1>
              <p className="text-muted-foreground">Discover and connect with the perfect vendors for your event</p>
            </div>
            
            {currentUser && events.length > 0 && (
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select event for quotation" />
                </SelectTrigger>
                <SelectContent>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search vendors by name, type, or location..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" className="mb-8" onValueChange={setSelectedType}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Vendors</TabsTrigger>
              <TabsTrigger value="venue">Venues</TabsTrigger>
              <TabsTrigger value="catering">Catering</TabsTrigger>
              <TabsTrigger value="entertainment">Entertainment</TabsTrigger>
              <TabsTrigger value="photography">Photography</TabsTrigger>
              <TabsTrigger value="decor">Decor</TabsTrigger>
              <TabsTrigger value="beauty">Beauty</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array(6).fill(0).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))
                ) : filteredVendors.length > 0 ? (
                  filteredVendors.map(vendor => (
                    <Card key={vendor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <Link to={`/vendor/${vendor.id}`}>
                        <div className="h-48 overflow-hidden">
                          <OptimizedImage 
                            src={vendor.images[0]} 
                            alt={vendor.name} 
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      </Link>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="bg-accent/50">
                            {vendor.type}
                          </Badge>
                          <div className="flex items-center">
                            <IndianRupee size={14} className="mr-1" />
                            <span className="text-sm font-medium">
                              {formatPrice(vendor.priceRange.min)} - {formatPrice(vendor.priceRange.max)}
                            </span>
                          </div>
                        </div>
                        <CardTitle className="mt-2 flex justify-between items-start">
                          <Link to={`/vendor/${vendor.id}`} className="hover:text-primary transition-colors hover:underline">
                            {vendor.name}
                          </Link>
                        </CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin size={14} className="mr-1" />
                          {vendor.location}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">{vendor.description}</p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="ml-1 text-sm font-medium">{vendor.rating}</span>
                            <span className="mx-1 text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{vendor.reviews} reviews</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock size={14} className="mr-1" />
                            <span>{vendor.responseTime}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {vendor.specialties.slice(0, 2).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {vendor.specialties.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{vendor.specialties.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.location.href = `tel:${vendor.phone}`}
                              >
                                <Phone size={14} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Call vendor</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.location.href = `mailto:${vendor.email}`}
                              >
                                <Mail size={14} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Email vendor</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Button 
                          className="flex-1"
                          onClick={() => {
                            if (!currentUser) {
                              window.location.href = '/login';
                              return;
                            }
                            if (!selectedEvent) {
                              alert('Please select an event first');
                              return;
                            }
                            requestQuotation(vendor.id, selectedEvent);
                          }}
                        >
                          Request Quote
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground mb-4">No vendors found matching your criteria</p>
                    <Button variant="outline" onClick={() => {
                      setSearchTerm('');
                      setSelectedType('all');
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Other tab contents use the same filtering logic */}
            {['venue', 'catering', 'entertainment', 'photography', 'decor', 'beauty'].map(type => (
              <TabsContent key={type} value={type}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    Array(6).fill(0).map((_, index) => (
                      <SkeletonCard key={index} />
                    ))
                  ) : filteredVendors.length > 0 ? (
                    filteredVendors.map(vendor => (
                      <Card key={vendor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <Link to={`/vendor/${vendor.id}`}>
                          <div className="h-48 overflow-hidden">
                            <OptimizedImage 
                              src={vendor.images[0]} 
                              alt={vendor.name} 
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        </Link>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="bg-accent/50">
                              {vendor.type}
                            </Badge>
                            <div className="flex items-center">
                              <IndianRupee size={14} className="mr-1" />
                              <span className="text-sm font-medium">
                                {formatPrice(vendor.priceRange.min)} - {formatPrice(vendor.priceRange.max)}
                              </span>
                            </div>
                          </div>
                          <CardTitle className="mt-2 flex justify-between items-start">
                            <Link to={`/vendor/${vendor.id}`} className="hover:text-primary transition-colors hover:underline">
                              {vendor.name}
                            </Link>
                          </CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin size={14} className="mr-1" />
                            {vendor.location}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">{vendor.description}</p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center">
                              <Star size={14} className="text-yellow-500 fill-yellow-500" />
                              <span className="ml-1 text-sm font-medium">{vendor.rating}</span>
                              <span className="mx-1 text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">{vendor.reviews} reviews</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock size={14} className="mr-1" />
                              <span>{vendor.responseTime}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {vendor.specialties.slice(0, 2).map((specialty, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {vendor.specialties.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{vendor.specialties.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.location.href = `tel:${vendor.phone}`}
                                >
                                  <Phone size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Call vendor</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.location.href = `mailto:${vendor.email}`}
                                >
                                  <Mail size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Email vendor</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <Button 
                            className="flex-1"
                            onClick={() => {
                              if (!currentUser) {
                                window.location.href = '/login';
                                return;
                              }
                              if (!selectedEvent) {
                                alert('Please select an event first');
                                return;
                              }
                              requestQuotation(vendor.id, selectedEvent);
                            }}
                          >
                            Request Quote
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground mb-4">No {type} vendors found</p>
                      <Button variant="outline" onClick={() => {
                        setSearchTerm('');
                        setSelectedType('all');
                      }}>
                        View All Vendors
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Vendors;
