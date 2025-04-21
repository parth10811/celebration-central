import React from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentStatus } from '@/components/PaymentStatus';
import { EventItem } from '@/context/EventContext';

interface EventCardProps {
  event: EventItem;
}

export function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {event.image && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{event.title}</h3>
            <p className="text-sm text-muted-foreground">{event.type}</p>
          </div>
          <PaymentStatus paid={event.consultancyFeePaid} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(event.date), 'PPP')}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{event.guests} guests</span>
        </div>

        <p className="text-sm line-clamp-2">{event.description}</p>
      </CardContent>

      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate(`/events/${event.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
} 