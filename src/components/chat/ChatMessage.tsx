import { cn } from "@/lib/utils";
import { Message } from "@/types";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-1 rounded-lg px-3 py-2",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <p className="break-words text-sm">{message.content}</p>
        <div className="flex items-center justify-end gap-1">
          <span className="text-xs opacity-75">
            {format(message.createdAt, "HH:mm")}
          </span>
          {isCurrentUser && (
            <span className="text-xs opacity-75">
              {message.read ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 