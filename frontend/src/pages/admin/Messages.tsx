import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, AlertCircle } from 'lucide-react';
import { messageApi } from '@/api/message.api';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner, LoadingPage } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatRelative, getFullName, getInitials } from '@/utils/formatters';
import { useAuthStore } from '@/store/authStore';
import type { Conversation, Message } from '@/types';

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  // Fetch conversations
  const {
    data: conversations,
    isLoading: convLoading,
    isError: convError,
  } = useQuery({
    queryKey: ['messages', 'conversations'],
    queryFn: async () => {
      const res = await messageApi.getConversations();
      return res.data.data;
    },
    refetchInterval: 15000,
  });

  // Fetch messages for selected partner
  const {
    data: messagesData,
    isLoading: msgsLoading,
  } = useQuery({
    queryKey: ['messages', 'thread', selectedPartnerId],
    queryFn: async () => {
      if (!selectedPartnerId) return null;
      const res = await messageApi.getMessagesWith(selectedPartnerId, { limit: 100 });
      return res.data.data;
    },
    enabled: !!selectedPartnerId,
    refetchInterval: 10000,
  });

  const sendMutation = useMutation({
    mutationFn: (payload: { receiverId: string; subject: string; body: string }) =>
      messageApi.send(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText('');
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => messageApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const messages = messagesData?.data ?? [];
  const selectedConversation = conversations?.find(
    (c) => c.partner.id === selectedPartnerId,
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark unread messages as read when selecting a conversation
  useEffect(() => {
    if (!selectedPartnerId || !messages.length || !currentUser) return;
    const unread = messages.filter(
      (m) => m.receiverId === currentUser.id && !m.isRead,
    );
    unread.forEach((m) => markReadMutation.mutate(m.id));
  }, [selectedPartnerId, messages, currentUser]);

  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPartnerId || !messageText.trim()) return;
      sendMutation.mutate({
        receiverId: selectedPartnerId,
        subject: 'Message',
        body: messageText.trim(),
      });
    },
    [selectedPartnerId, messageText, sendMutation],
  );

  const handleSelectConversation = useCallback((partnerId: string) => {
    setSelectedPartnerId(partnerId);
  }, []);

  if (convLoading) {
    return <LoadingPage message="Loading messages..." />;
  }

  if (convError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">Failed to load messages</h3>
      </div>
    );
  }

  const conversationList: Conversation[] = conversations ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Communicate with sponsors and other users"
      />

      <div className="flex h-[calc(100vh-220px)] min-h-[500px] overflow-hidden rounded-lg border bg-background">
        {/* Left Panel: Conversation List */}
        <div className="w-80 shrink-0 border-r flex flex-col">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold text-muted-foreground">Conversations</h3>
          </div>
          <ScrollArea className="flex-1">
            {conversationList.length > 0 ? (
              <div className="divide-y">
                {conversationList.map((conv) => {
                  const isSelected = conv.partner.id === selectedPartnerId;
                  return (
                    <button
                      key={conv.partner.id}
                      onClick={() => handleSelectConversation(conv.partner.id)}
                      className={cn(
                        'flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50',
                        isSelected && 'bg-muted',
                      )}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        {conv.partner.avatarUrl && (
                          <AvatarImage src={conv.partner.avatarUrl} alt={getFullName(conv.partner)} />
                        )}
                        <AvatarFallback className="text-xs">
                          {getInitials(conv.partner.firstName, conv.partner.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {getFullName(conv.partner)}
                          </span>
                          {conv.unreadCount > 0 && (
                            <Badge
                              variant="default"
                              className="ml-2 h-5 w-5 shrink-0 rounded-full p-0 text-[10px] flex items-center justify-center"
                            >
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {conv.partner.role.toLowerCase()}
                        </p>
                        {conv.lastMessage && (
                          <p className="mt-1 text-xs text-muted-foreground truncate">
                            {conv.lastMessage.body}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Panel: Message Thread */}
        <div className="flex flex-1 flex-col">
          {selectedPartnerId && selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b p-4">
                <Avatar className="h-9 w-9">
                  {selectedConversation.partner.avatarUrl && (
                    <AvatarImage
                      src={selectedConversation.partner.avatarUrl}
                      alt={getFullName(selectedConversation.partner)}
                    />
                  )}
                  <AvatarFallback className="text-xs">
                    {getInitials(
                      selectedConversation.partner.firstName,
                      selectedConversation.partner.lastName,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {getFullName(selectedConversation.partner)}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {selectedConversation.partner.role.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {msgsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {[...messages].reverse().map((msg) => {
                      const isOwn = msg.senderId === currentUser?.id;
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex',
                            isOwn ? 'justify-end' : 'justify-start',
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[70%] rounded-lg px-4 py-2.5',
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted',
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                            <p
                              className={cn(
                                'mt-1 text-[10px]',
                                isOwn
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground',
                              )}
                            >
                              {formatRelative(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <Separator />
              <form onSubmit={handleSend} className="flex items-center gap-2 p-4">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!messageText.trim() || sendMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="Select a conversation"
                description="Choose a conversation from the left panel to view messages."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
