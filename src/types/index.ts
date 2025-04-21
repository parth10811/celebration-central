// Vendor Booking Types
export interface Booking {
  id: string;
  vendorId: string;
  customerId: string;
  eventId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  amount: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  contractSigned: boolean;
  contractUrl?: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  createdAt: Date;
  lastMessageAt: Date;
  lastMessage: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  read: boolean;
}

// Review Types
export interface Review {
  id: string;
  vendorId: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  eventId?: string;
}

// Event Timeline Types
export interface TimelineItem {
  id: string;
  eventId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  assignedTo?: string[];
  category: 'venue' | 'catering' | 'decoration' | 'entertainment' | 'other';
  priority: 'low' | 'medium' | 'high';
}

// Invoice Types
export interface Invoice {
  id: string;
  eventId: string;
  vendorId: string;
  customerId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'chat' | 'review' | 'timeline' | 'invoice' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
} 