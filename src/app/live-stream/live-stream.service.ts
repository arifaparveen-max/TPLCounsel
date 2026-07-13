import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LiveStreamService {
  private readonly roomName = 'default-room';
  private readonly hubUrl = environment.hubUrl;
  private connection?: signalR.HubConnection;
  private connectionPromise?: Promise<void>;

  async createConnection(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('Connection already established');
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._createConnection();
    return this.connectionPromise;
  }

  private async _createConnection(): Promise<void> {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
          withCredentials: true,
        })
        .withAutomaticReconnect([0, 0, 0, 0, 0, 0, 1000, 3000, 5000, 10000])
        .build();

      this.connection.onclose(async () => {
        console.log('SignalR connection closed');
        this.connectionPromise = undefined;
      });

      this.connection.onreconnecting((error) => {
        console.log('SignalR reconnecting...', error);
      });

      this.connection.onreconnected((connectionId) => {
        console.log('SignalR reconnected with ID:', connectionId);
      });

      await this.connection.start();
      console.log('SignalR connection established, state:', this.connection.state);
      this.connectionPromise = undefined;
    } catch (error) {
      console.error('Failed to establish SignalR connection:', error);
      this.connection = undefined;
      this.connectionPromise = undefined;
      throw error;
    }
  }

  onViewerJoined(handler: (viewerConnectionId: string) => void): void {
    if (!this.connection) {
      console.error('Connection not initialized when setting up onViewerJoined');
      return;
    }

    this.connection.on('viewerJoined', handler);
    console.log('Registered onViewerJoined handler');
  }

  async joinRoom(role: 'sender' | 'viewer'): Promise<void> {
    await this.ensureConnection();
    console.log('Joining room as', role);

    try {
      await this.connection!.invoke('JoinRoom', this.roomName);
      console.log('Joined room:', this.roomName);

      if (role === 'sender') {
        await this.connection!.invoke('StartBroadcast', this.roomName);
        console.log('Started broadcast');
      } else {
        await this.connection!.invoke('JoinAsViewer', this.roomName);
        console.log('Joined as viewer');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  async sendOffer(
    offer: string,
    viewerConnectionId: string
  ): Promise<void> {

    await this.ensureConnection();
    console.log("Invoking SendOffer");
    await this.connection!.invoke(
      'SendOffer',
      this.roomName,
      offer,
      viewerConnectionId
    );
  }

  async sendAnswer(answer: string, senderConnectionId: string): Promise<void> {
    await this.ensureConnection();
    console.log('Sending answer to:', senderConnectionId);
    await this.connection!.invoke('SendAnswer', this.roomName, answer, senderConnectionId);
  }

  async sendIceCandidate(candidate: string, targetConnectionId: string): Promise<void> {
    await this.ensureConnection();
    await this.connection!.invoke('SendIceCandidate', this.roomName, candidate, targetConnectionId);
  }

  onReceiveOffer(handler: (offer: string, senderConnectionId: string) => void): void {
    if (!this.connection) {
      console.error('Connection not initialized when setting up onReceiveOffer');
      return;
    }
    this.connection.on('receiveOffer', handler);
    console.log('Registered onReceiveOffer handler');
  }

  onReceiveAnswer(handler: (answer: string, senderConnectionId: string) => void): void {
    if (!this.connection) {
      console.error('Connection not initialized when setting up onReceiveAnswer');
      return;
    }
    this.connection.on('receiveAnswer', handler);
    console.log('Registered onReceiveAnswer handler');
  }

  onReceiveIceCandidate(handler: (candidate: string, fromConnectionId: string) => void): void {
    if (!this.connection) {
      console.error('Connection not initialized when setting up onReceiveIceCandidate');
      return;
    }
    this.connection.on('receiveIceCandidate', handler);
    console.log('Registered onReceiveIceCandidate handler');
  }

  onError(handler: (message: string) => void): void {
    if (!this.connection) {
      console.error('Connection not initialized when setting up onError');
      return;
    }
    this.connection.on('error', handler);
    console.log('Registered onError handler');
  }

  async disconnect(): Promise<void> {
    if (!this.connection) {
      return;
    }

    try {
      await this.connection.stop();
    } catch (error) {
      console.error('Error stopping connection:', error);
    }
    this.connection = undefined;
    this.connectionPromise = undefined;
  }

  private async ensureConnection(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      console.log('Connection is already connecting, waiting...');
      await this.connectionPromise;
      return;
    }

    console.log('Connection not ready, creating new connection');
    await this.createConnection();
  }
}
