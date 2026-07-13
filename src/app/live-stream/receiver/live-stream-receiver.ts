import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LiveStreamService } from '../live-stream.service';

@Component({
  selector: 'app-live-stream-receiver',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './live-stream-receiver.html',
  styles: [
    `
      .stream-page { min-height: calc(100vh - 120px); padding: 32px 16px; background: #121518; color: #f5f2eb; }
      .stream-shell { max-width: 960px; margin: 0 auto; display: grid; gap: 20px; }
      .stream-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px; }
      video { width: 100%; border-radius: 16px; background: #000; min-height: 320px; }
      button { background: #aa9166; color: #111; border: none; border-radius: 999px; padding: 10px 18px; font-weight: 700; cursor: pointer; }
      button.nav-button { padding: 8px 16px; font-size: 14px; background: #2e2e2e; color: #f5f2eb; border: 1px solid rgba(170, 145, 102, 0.3); }
      button.nav-button.active { background: #aa9166; color: #111; border-color: #aa9166; }
      button.nav-button:hover { background: #3a3a3a; }
      button.nav-button.active:hover { background: #aa9166; }
      .status { color: #c9b08d; font-weight: 600; }
    `,
  ],
})
export class LiveStreamReceiver implements OnInit, OnDestroy {
  @ViewChild('remoteVideo') remoteVideo?: ElementRef<HTMLVideoElement>;

  status = 'Waiting for broadcaster';
  isWatching = false;
  errorMessage = '';

  private peerConnection?: RTCPeerConnection;
  private senderConnectionId?: string;

  constructor(private liveStreamService: LiveStreamService) {}

  async ngOnInit(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    await this.liveStreamService.createConnection();
    this.liveStreamService.onReceiveOffer((offer, senderConnectionId) => {
      console.log('Offer received');
      this.senderConnectionId = senderConnectionId;
      this.handleIncomingOffer(offer);
    });

    this.liveStreamService.onReceiveIceCandidate((candidate, fromConnectionId) => {
      if (fromConnectionId === this.senderConnectionId && this.peerConnection) {
        this.peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
      }
    });

    this.liveStreamService.onError((message) => {
      this.errorMessage = message;
      this.status = 'Error';
    });
  }

  async ngOnDestroy(): Promise<void> {
    this.peerConnection?.close();
    await this.liveStreamService.disconnect();
  }

  async connectToBroadcast(): Promise<void> {
    this.errorMessage = '';
    this.status = 'Connecting';

    try {
      await this.liveStreamService.joinRoom('viewer');
      await this.initializePeerConnection();
      this.isWatching = true;
      this.status = 'Connected. Waiting for stream...';
    } catch (error) {
      this.errorMessage = 'Unable to connect to the stream.';
      this.status = 'Connection failed';
      console.error(error);
    }
  }

  private async initializePeerConnection(): Promise<void> {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.peerConnection.ontrack = (event) => {
      
      const [stream] = event.streams;
      if (this.remoteVideo?.nativeElement && stream) {
        this.remoteVideo.nativeElement.srcObject = stream;
      }
      console.log('Remote track received');
    };

    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate && this.senderConnectionId) {
        await this.liveStreamService.sendIceCandidate(JSON.stringify(event.candidate), this.senderConnectionId);
      }
    };
  }

  private async handleIncomingOffer(offer: string): Promise<void> {
    if (!this.peerConnection) {
      await this.initializePeerConnection();
    }

    const parsedOffer = JSON.parse(offer);
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(parsedOffer));
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    await this.liveStreamService.sendAnswer(JSON.stringify(answer), this.senderConnectionId!);
    this.status = 'Receiving stream';

      console.log('Setting remote description');

      await this.peerConnection!.setRemoteDescription(
      new RTCSessionDescription(JSON.parse(offer))
      );

      console.log('Creating answer');
      await this.peerConnection!.setLocalDescription(answer);
      console.log('Sending answer');
      await this.liveStreamService.sendAnswer(
      JSON.stringify(answer),
      this.senderConnectionId!
      );
  }
}
