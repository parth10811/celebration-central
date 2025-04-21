import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { ChatRoom } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from "../ui/scroll-area";

export default function ChatList() {
  const { user } = useAuth();
  const { chatRooms, loading } = useChat();
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    if (user && chatRooms) {
      const rooms = chatRooms.filter(room => 
        room.participants.includes(user.uid)
      ).sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
      setFilteredRooms(rooms);
    }
  }, [chatRooms, user]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!filteredRooms.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No chat rooms found
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-1">
        {filteredRooms.map((room) => (
          <button
            key={room.id}
            className="w-full p-4 hover:bg-accent rounded-lg transition-colors"
            onClick={() => {/* Handle room selection */}}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">
                  {room.participants.filter(id => id !== user?.uid).join(", ")}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {room.lastMessage}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(room.lastMessageAt, { addSuffix: true })}
              </span>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
} 