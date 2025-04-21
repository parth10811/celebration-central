import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, query, getDocs, onSnapshot, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Message, ChatRoom } from '@/types';
import { useAuth } from './AuthContext';

interface ChatContextType {
  messages: Message[];
  chatRooms: ChatRoom[];
  loading: boolean;
  error: string | null;
  sendMessage: (roomId: string, content: string, senderId: string) => Promise<void>;
  createChatRoom: (participantIds: string[]) => Promise<string>;
  getChatRoom: (participantId: string) => Promise<ChatRoom | null>;
  getChatRoomMessages: (roomId: string) => Promise<Message[]>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { userData } = useAuth();

  // Fetch user's chat rooms
  useEffect(() => {
    if (!auth.currentUser || !userData) return;

    const unsubscribeRooms = onSnapshot(
      query(
        collection(db, 'chatRooms'),
        where('participants', 'array-contains', auth.currentUser.uid),
        orderBy('lastMessageAt', 'desc')
      ),
      (snapshot) => {
        const rooms: ChatRoom[] = [];
        snapshot.forEach((doc) => {
          rooms.push({ id: doc.id, ...doc.data() } as ChatRoom);
        });
        setChatRooms(rooms);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching chat rooms:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch chat rooms. Please try again later.',
        });
        setLoading(false);
      }
    );

    return () => unsubscribeRooms();
  }, [userData, toast]);

  const sendMessage = async (roomId: string, content: string, senderId: string) => {
    if (!auth.currentUser) throw new Error('User not authenticated');

    try {
      const messageRef = collection(db, 'messages');
      const roomRef = collection(db, 'chatRooms');
      
      await addDoc(messageRef, {
        content,
        senderId,
        roomId,
        createdAt: serverTimestamp(),
        read: false,
      });

      // Update the chat room's last message and timestamp
      const roomDoc = chatRooms.find(room => room.id === roomId);
      if (roomDoc) {
        await addDoc(roomRef, {
          ...roomDoc,
          lastMessage: content,
          lastMessageAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      });
    }
  };

  const createChatRoom = async (participantIds: string[]) => {
    if (!auth.currentUser) throw new Error('User not authenticated');

    try {
      const roomRef = collection(db, 'chatRooms');
      const newRoom = await addDoc(roomRef, {
        participants: participantIds,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        lastMessage: '',
      });
      return newRoom.id;
    } catch (error) {
      console.error('Error creating chat room:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create chat room. Please try again.',
      });
      throw error;
    }
  };

  const getChatRoom = async (participantId: string): Promise<ChatRoom | null> => {
    if (!auth.currentUser) throw new Error('User not authenticated');

    try {
      const roomsQuery = query(
        collection(db, 'chatRooms'),
        where('participants', 'array-contains', auth.currentUser.uid)
      );
      const snapshot = await getDocs(roomsQuery);
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatRoom[];

      return rooms.find(room => 
        room.participants.includes(participantId)
      ) || null;
    } catch (err) {
      console.error('Error fetching chat room:', err);
      throw err;
    }
  };

  const getChatRoomMessages = async (roomId: string): Promise<Message[]> => {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('roomId', '==', roomId),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(messagesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
    } catch (err) {
      console.error('Error fetching messages:', err);
      throw err;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        chatRooms,
        loading,
        error,
        sendMessage,
        createChatRoom,
        getChatRoom,
        getChatRoomMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}; 