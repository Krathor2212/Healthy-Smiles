import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://10.10.112.140:4000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Chat events
  joinChat(chatId: string) {
    this.socket?.emit('join_chat', chatId);
  }

  leaveChat(chatId: string) {
    this.socket?.emit('leave_chat', chatId);
  }

  sendMessage(chatId: string, message: string, receiverId: string) {
    this.socket?.emit('send_message', { chatId, message, receiverId });
  }

  onMessageReceived(callback: (data: any) => void) {
    this.socket?.on('message_received', callback);
  }

  onTyping(callback: (data: any) => void) {
    this.socket?.on('typing', callback);
  }

  emitTyping(chatId: string, isTyping: boolean) {
    this.socket?.emit('typing', { chatId, isTyping });
  }
}

export default new SocketService();
