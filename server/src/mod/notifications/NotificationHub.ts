import { randomUUID } from 'node:crypto';
import type { WebSocket } from 'ws';
import { createEnvelope, type NotificationPayload, type ServerMessage } from './protocol.js';

export const HEARTBEAT_INTERVAL_MS = 30_000;

interface Client {
  socket: WebSocket;
  connectionId: string;
  alive: boolean;
}

export class NotificationHub {
  private readonly clients = new Set<Client>();
  private timer: NodeJS.Timeout | null = null;

  public constructor(private readonly serverVersion: string) {}

  public get size(): number {
    return this.clients.size;
  }

  public attach(socket: WebSocket): void {
    const client: Client = { socket, connectionId: randomUUID(), alive: true };
    this.clients.add(client);

    socket.on('pong', () => {
      client.alive = true;
    });
    socket.on('close', () => {
      this.clients.delete(client);
    });
    socket.on('error', () => {
      socket.terminate();
    });

    this.send(
      client,
      createEnvelope('hello', {
        connectionId: client.connectionId,
        serverVersion: this.serverVersion,
        heartbeatIntervalSec: HEARTBEAT_INTERVAL_MS / 1000,
      }),
    );
    this.startHeartbeat();
  }

  public publish(payload: NotificationPayload): number {
    const message = createEnvelope('notification', payload);
    let delivered = 0;
    for (const client of this.clients) {
      if (this.send(client, message)) delivered += 1;
    }
    return delivered;
  }

  public close(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    for (const client of this.clients) {
      client.socket.close(1001, 'server shutting down');
    }
    this.clients.clear();
  }

  private send(client: Client, message: ServerMessage): boolean {
    if (client.socket.readyState !== client.socket.OPEN) return false;
    client.socket.send(JSON.stringify(message));
    return true;
  }

  private startHeartbeat(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.beat(), HEARTBEAT_INTERVAL_MS);
    this.timer.unref();
  }

  private beat(): void {
    for (const client of this.clients) {
      if (!client.alive) {
        client.socket.terminate();
        this.clients.delete(client);
        continue;
      }
      client.alive = false;
      client.socket.ping();
    }

    if (this.clients.size === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
