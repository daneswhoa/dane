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

  constructor(private readonly agentService: AgentService) {}

  // Map user ID to set of active socket IDs
  private userSockets = new Map<string, Set<string>>();


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

  @SubscribeMessage('sophia-message')
  async handleSophiaMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message: string; conversationId?: number; navigationHistory?: any[] }
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

    if (!data || !data.message) {
      client.emit('sophia-error', { message: 'Empty query.' });
      return;
    }

    await this.agentService.handleUserRequest(
      userId,
      role,
      allowedProperties,
      data.message,
      client,
      data.navigationHistory,
      data.conversationId
    );
  }
}


