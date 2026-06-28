import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { auth } from '../auth/better-auth';
import { AgentService } from '../agent/agent.service';
import { AgentMemoryService } from '../agent/agent-memory.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  namespace: 'events',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly agentService: AgentService,
    private readonly agentMemoryService: AgentMemoryService
  ) {}

  // Map user ID to set of active socket IDs
  private userSockets = new Map<string, Set<string>>();
  // Map socket client ID to active stream AbortController
  private activeStreams = new Map<string, AbortController>();

  async handleConnection(client: Socket) {
    try {
      const cookieHeader = client.handshake.headers.cookie || '';
      const headers = new Headers();
      headers.set('cookie', cookieHeader);

      const session = await auth.api.getSession({ headers });
      if (!session) {
        client.disconnect();
        return;
      }

      const userId = session.user.id;
      client.data.userId = userId;
      client.data.role = session.user.role;
      client.data.allowedProperties = (session.user as any).allowedProperties || undefined;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join a room scoped to this user ID
      await client.join(`user:${userId}`);

      // Join a room scoped to their role
      await client.join(`role:${session.user.role}`);

      console.log(`Socket client connected: ${client.id} (User: ${userId}, Role: ${session.user.role})`);
    } catch (err) {
      console.error('Socket connection auth error:', err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Clean up active streams
    if (this.activeStreams.has(client.id)) {
      this.activeStreams.get(client.id)!.abort();
      this.activeStreams.delete(client.id);
    }

    const userId = client.data.userId;
    if (userId && this.userSockets.has(userId)) {
      const sockets = this.userSockets.get(userId)!;
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    console.log(`Socket client disconnected: ${client.id}`);
  }

  // Send an event to all sockets of a specific user
  sendToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  // Send an event to all sockets of a role
  sendToRole(role: string, event: string, payload: any) {
    this.server.to(`role:${role}`).emit(event, payload);
  }

  // Send to all connected sockets
  broadcast(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  @SubscribeMessage('sophia-stop')
  handleSophiaStop(@ConnectedSocket() client: Socket) {
    if (this.activeStreams.has(client.id)) {
      this.activeStreams.get(client.id)!.abort();
      this.activeStreams.delete(client.id);
      console.log(`Sophia stream aborted on user request for client: ${client.id}`);
      client.emit('sophia-status', { status: 'idle', message: 'Interrupted by user' });
    }
  }

  @SubscribeMessage('sophia-message')
  async handleSophiaMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      message: string;
      conversationId?: number;
      conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
      fileData?: { base64Data: string; fileName: string };
      audioData?: { base64Data: string; mimeType: string };
      duration?: number;
    }
  ) {
    let userId = client.data.userId;
    let role = client.data.role;
    let allowedProperties = client.data.allowedProperties;

    // Fallback authorization check if connection state was cleared or was not initialized
    if (!userId) {
      try {
        const cookieHeader = client.handshake.headers.cookie || '';
        const headers = new Headers();
        headers.set('cookie', cookieHeader);
        const session = await auth.api.getSession({ headers });
        if (session) {
          userId = session.user.id;
          role = session.user.role;
          allowedProperties = (session.user as any).allowedProperties || undefined;

          // Cache on the client instance
          client.data.userId = userId;
          client.data.role = role;
          client.data.allowedProperties = allowedProperties;
        }
      } catch (err) {
        console.error('Sophia WebSocket message session fallback validation failed:', err);
      }
    }

    if (!userId) {
      client.emit('sophia-error', { message: 'Unauthorized session.' });
      return;
    }

    if (!data || (!data.message && !data.audioData)) {
      client.emit('sophia-error', { message: 'Empty query.' });
      return;
    }

    // Abort any existing stream for this socket first
    if (this.activeStreams.has(client.id)) {
      this.activeStreams.get(client.id)!.abort();
    }

    const abortController = new AbortController();
    this.activeStreams.set(client.id, abortController);

    try {
      // 1. Resolve conversation history: load from database if conversationId is provided
      let historyFromDb: any[] = [];
      let mappedHistory: { role: 'user' | 'assistant'; content: string }[] = [];

      if (data.conversationId) {
        historyFromDb = await this.agentMemoryService.loadConversationHistory(userId, data.conversationId);
        mappedHistory = historyFromDb.map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text || m.content || '',
        }));
      } else if (data.conversationHistory) {
        mappedHistory = data.conversationHistory;
      }

      // 2. Prepare user message payload to save in DB later
      let userMsgText = data.message || '';
      if (data.fileData) {
        userMsgText = data.message ? `${data.message}\n[Attached Image]` : '[Attached Image]';
      } else if (data.audioData) {
        userMsgText = data.message || '🎤 Voice message';
      }

      const userMsgObj: any = {
        id: String(Date.now()),
        sender: 'user',
        text: userMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (data.audioData) {
        userMsgObj.audioBase64 = data.audioData.base64Data;
        userMsgObj.audioMimeType = data.audioData.mimeType;
        userMsgObj.duration = data.duration || 0;
      }

      if (data.fileData) {
        userMsgObj.attachedImage = data.fileData.base64Data;
      }

      // 3. Execute stream
      const eventStream = this.agentService.runAgent(
        userId,
        role,
        allowedProperties,
        data.message,
        mappedHistory,
        data.fileData,
        data.audioData,
        abortController.signal
      );

      let accumulatedResponse = '';

      for await (const event of eventStream) {
        if (event.type === 'text') {
          accumulatedResponse += event.payload;
          client.emit('sophia-token', { text: event.payload });
        } else if (event.type === 'status') {
          client.emit('sophia-status', event.payload);
        } else if (event.type === 'action_start') {
          client.emit('sophia-action-start', event.payload);
        } else if (event.type === 'action_end') {
          client.emit('sophia-action-end', event.payload);
        } else if (event.type === 'widget') {
          client.emit('sophia-widget', event.payload);
        } else if (event.type === 'error') {
          client.emit('sophia-error', event.payload);
        }
      }

      // 4. Save thread to database if conversationId exists and stream wasn't aborted
      if (data.conversationId && !abortController.signal.aborted) {
        const sophiaMsgObj = {
          id: String(Date.now() + 1),
          sender: 'sophia',
          text: accumulatedResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const updatedHistory = [...historyFromDb, userMsgObj, sophiaMsgObj];
        await this.agentMemoryService.saveConversationHistory(userId, updatedHistory, data.conversationId);
      }

    } catch (err: any) {
      if (err.message !== 'AbortError') {
        client.emit('sophia-error', { message: `Sophia execution failed: ${err.message}` });
      }
    } finally {
      if (this.activeStreams.get(client.id) === abortController) {
        this.activeStreams.delete(client.id);
      }
    }
  }
}
