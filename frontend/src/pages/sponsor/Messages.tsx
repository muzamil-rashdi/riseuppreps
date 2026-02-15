import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Send,
  Loader2,
  Search,
  User,
  Check,
  CheckCheck,
  ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { messageApi } from '@/api/message.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatRelative, getFullName, getInitials } from '@/utils/formatters';
import type { Conversation, Message } from '@/types';

export default function SponsorMessages() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [messageBody, setMessageBody] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newReceiverId, setNewReceiverId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversationsData, isLoading: convLoading } = useQuery({
    queryKey: ['messages', 'conversations'],
    queryFn: () => messageApi.getConversations(),
    select: (res) => res.data.data,
    refetchInterval: 15000,
  });
  const conversations: Conversation[] = conversationsData ?? [];

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) =>
      `${c.partner.firstName} ${c.partner.lastName}`.toLowerCase().includes(q),
    );
  }, [conversations, searchQuery]);

  // Fetch messages for selected partner
  const { data: messagesRes, isLoading: msgLoading } = useQuery({
    queryKey: ['messages', 'thread', selectedPartnerId],
    queryFn: () => messageApi.getMessagesWith(selectedPartnerId!, { page: 1, limit: 100 }),
    enabled: !!selectedPartnerId,
    select: (res) => res.data.data,
    refetchInterval: 10000,
  });
  const messages: Message[] = messagesRes?.data ?? [];

  // Sort messages oldest first for display
  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages],
  );

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: messageApi.send,
    onSuccess: () => {
      setMessageBody('');
      setMessageSubject('');
      setShowNewMessage(false);
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // Mark message as read
  const markReadMutation = useMutation({
    mutationFn: messageApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedMessages]);

  // Mark unread messages as read when opening a conversation
  useEffect(() => {
    if (selectedPartnerId && messages.length > 0) {
      const unread = messages.filter((m) => !m.isRead && m.senderId !== user?.id);
      unread.forEach((m) => markReadMutation.mutate(m.id));
    }
  }, [selectedPartnerId, messages]);

  function handleSend() {
    if (!messageBody.trim()) return;
    const receiverId = selectedPartnerId || newReceiverId;
    if (!receiverId) return;
    sendMutation.mutate({
      receiverId,
      subject: messageSubject || 'Message',
      body: messageBody.trim(),
    });
  }

  function selectConversation(partnerId: string) {
    setSelectedPartnerId(partnerId);
    setShowNewMessage(false);
  }

  const selectedPartner = conversations.find((c) => c.partner.id === selectedPartnerId)?.partner;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with the academy administration.
        </p>
      </div>

      {/* Messaging UI */}
      <Card className="overflow-hidden">
        <div className="flex h-[calc(100vh-280px)] min-h-[500px]">
          {/* Conversation List */}
          <div
            className={cn(
              'w-full border-r sm:w-80 sm:block',
              selectedPartnerId ? 'hidden sm:block' : 'block',
            )}
          >
            <div className="flex h-full flex-col">
              {/* Search & New Message */}
              <div className="border-b p-3 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {convLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                    <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    <p>No conversations yet.</p>
                    <p className="text-xs">Messages with admin will appear here.</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.partner.id}
                      className={cn(
                        'flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50',
                        selectedPartnerId === conv.partner.id && 'bg-muted',
                      )}
                      onClick={() => selectConversation(conv.partner.id)}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        {conv.partner.avatarUrl && <AvatarImage src={conv.partner.avatarUrl} />}
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(conv.partner.firstName, conv.partner.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-medium">
                            {getFullName(conv.partner)}
                          </p>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatRelative(conv.lastMessage.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="truncate text-xs text-muted-foreground">
                            {conv.lastMessage.body}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="ml-2 h-5 w-5 shrink-0 items-center justify-center rounded-full p-0 text-[10px]">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="mt-0.5 text-[10px]">
                          {conv.partner.role}
                        </Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Thread */}
          <div
            className={cn(
              'flex flex-1 flex-col',
              !selectedPartnerId && !showNewMessage ? 'hidden sm:flex' : 'flex',
            )}
          >
            {!selectedPartnerId && !showNewMessage ? (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-30" />
                  <p className="font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the list to start messaging.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Thread Header */}
                <div className="flex items-center gap-3 border-b px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="sm:hidden"
                    onClick={() => { setSelectedPartnerId(null); setShowNewMessage(false); }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  {selectedPartner ? (
                    <>
                      <Avatar className="h-9 w-9">
                        {selectedPartner.avatarUrl && <AvatarImage src={selectedPartner.avatarUrl} />}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(selectedPartner.firstName, selectedPartner.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{getFullName(selectedPartner)}</p>
                        <p className="text-xs text-muted-foreground">{selectedPartner.role}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm font-medium">New Message</p>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {msgLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : sortedMessages.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                      No messages yet. Start the conversation below.
                    </div>
                  ) : (
                    sortedMessages.map((msg) => {
                      const isOwn = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[75%] rounded-2xl px-4 py-2.5',
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted rounded-bl-md',
                            )}
                          >
                            {msg.subject && msg.subject !== 'Message' && (
                              <p
                                className={cn(
                                  'mb-1 text-xs font-semibold',
                                  isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground',
                                )}
                              >
                                {msg.subject}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                            <div
                              className={cn(
                                'mt-1 flex items-center gap-1 text-[10px]',
                                isOwn ? 'text-primary-foreground/60 justify-end' : 'text-muted-foreground',
                              )}
                            >
                              <span>{formatRelative(msg.createdAt)}</span>
                              {isOwn && (
                                msg.isRead ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* New message for new conversation */}
                {showNewMessage && !selectedPartnerId && (
                  <div className="border-t px-4 py-2">
                    <Input
                      placeholder="Subject"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      className="mb-2 h-9"
                    />
                  </div>
                )}

                {/* Compose */}
                <div className="border-t p-3">
                  <div className="flex items-end gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      className="min-h-[44px] max-h-32 resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={sendMutation.isPending || !messageBody.trim()}
                    >
                      {sendMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
