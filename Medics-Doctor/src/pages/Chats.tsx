import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { MessageCircle, Search, Send, ArrowLeft, FileText, Image as ImageIcon, Video, File, RefreshCw } from 'lucide-react';

interface ChatContact {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

interface Message {
  id: string;
  text: string;
  time: string;
  sender: 'doctor' | 'patient';
  createdAt: string;
  file?: {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    url: string;
  } | null;
}

const Chats: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<ChatContact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch chat contacts
  const { data: contacts, isLoading: contactsLoading } = useQuery<ChatContact[]>({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await api.get('/doctor/chats');
      return response.data.contacts || [];
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Auto-select chat from URL parameter
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId && contacts) {
      const chat = contacts.find(c => c.id === chatId);
      if (chat) {
        setSelectedChat(chat);
        // Clear the query parameter
        setSearchParams({});
      }
    }
  }, [contacts, searchParams, setSearchParams]);

  // Fetch messages for selected chat
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['chatMessages', selectedChat?.id],
    queryFn: async () => {
      if (!selectedChat) return [];
      const response = await api.get(`/doctor/chats/${selectedChat.id}/messages`);
      return response.data.messages || [];
    },
    enabled: !!selectedChat,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (text: string) => {
      if (!selectedChat) return;
      const response = await api.post(`/doctor/chats/${selectedChat.id}/messages`, { text });
      return response.data;
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['chatMessages', selectedChat?.id] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && selectedChat) {
      sendMessage.mutate(messageText.trim());
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['chats'] }),
        selectedChat && queryClient.invalidateQueries({ queryKey: ['messages', selectedChat.id] })
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to download files');
        return;
      }

      const downloadUrl = `${api.defaults.baseURL}/files/medical/${fileId}/download`;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const filteredContacts = contacts?.filter(contact =>
    contact.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chats</h1>
          <p className="text-gray-600 mt-1">Chat with your patients</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all ${
            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Refresh chats"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-gray-700 font-medium">Refresh</span>
        </button>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Chat List */}
        <div className="lg:col-span-1 card flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {contactsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0091F5]"></div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <MessageCircle className="w-12 h-12 mb-2" />
                <p>No chats yet</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedChat(contact)}
                  className={`w-full p-4 hover:bg-gray-50 transition-colors border-b text-left ${
                    selectedChat?.id === contact.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {contact.patientName.charAt(0).toUpperCase()}
                      </div>
                      {contact.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 truncate">
                          {contact.patientName}
                        </p>
                        <p className="text-xs text-gray-500">{contact.lastMessageTime}</p>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                    </div>
                    {contact.unreadCount > 0 && (
                      <div className="bg-[#0091F5] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {contact.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2 card flex flex-col h-full">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="lg:hidden text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedChat.patientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedChat.patientName}</p>
                    <p className="text-sm text-gray-500">
                      {selectedChat.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0091F5]"></div>
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'doctor'
                            ? 'bg-[#0091F5] text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {/* File Attachment */}
                        {message.file && (
                          <button
                            onClick={() => handleFileDownload(message.file!.id, message.file!.name)}
                            className={`flex items-center space-x-2 p-2 rounded mb-2 w-full hover:opacity-80 transition-opacity ${
                              message.sender === 'doctor' ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <div className={message.sender === 'doctor' ? 'text-white' : 'text-gray-600'}>
                              {getFileIcon(message.file.mimeType)}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className={`text-sm font-medium truncate ${
                                message.sender === 'doctor' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {message.file.name}
                              </p>
                              <p className={`text-xs ${
                                message.sender === 'doctor' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatFileSize(message.file.size)}
                              </p>
                            </div>
                            <div className={message.sender === 'doctor' ? 'text-white' : 'text-gray-600'}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </div>
                          </button>
                        )}
                        
                        {/* Message Text */}
                        {message.text && (
                          <p className="text-sm">{message.text}</p>
                        )}
                        
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === 'doctor' ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 input-field"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sendMessage.isPending}
                    className="btn-primary px-4 py-2 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">Select a chat to start messaging</p>
              <p className="text-sm">Choose a patient from the list to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
