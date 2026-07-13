import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LiveStreamService } from '../live-stream.service';

@Component({
  selector: 'app-live-stream-sender',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './live-stream-sender.html',
  styles: [
    `
      .stream-page { min-height: calc(100vh - 120px); padding: 32px 16px; background: #121518; color: #f5f2eb; }
      .stream-shell { max-width: 960px; margin: 0 auto; display: grid; gap: 20px; }
      .stream-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px; }
      video { width: 100%; border-radius: 16px; background: #000; min-height: 320px; }
      button { background: #aa9166; color: #111; border: none; border-radius: 999px; padding: 10px 18px; font-weight: 700; cursor: pointer; }
      button.secondary { background: #2e2e2e; color: #f5f2eb; }
      button.nav-button { padding: 8px 16px; font-size: 14px; background: #2e2e2e; color: #f5f2eb; border: 1px solid rgba(170, 145, 102, 0.3); }
      button.nav-button.active { background: #aa9166; color: #111; border-color: #aa9166; }
      button.nav-button:hover { background: #3a3a3a; }
      button.nav-button.active:hover { background: #aa9166; }
      .status { color: #c9b08d; font-weight: 600; }
    `,
  ],
})
export class LiveStreamSender implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo?: ElementRef<HTMLVideoElement>;

  status = 'Ready to start';
  isStreaming = false;
  errorMessage = '';

  private peerConnection?: RTCPeerConnection;
  private localStream?: MediaStream;
  private viewerConnectionId?: string;

  constructor(private liveStreamService: LiveStreamService) { }

  async ngOnInit(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    await this.liveStreamService.createConnection();
    this.liveStreamService.onReceiveAnswer((answer, senderConnectionId) => {
      this.viewerConnectionId = senderConnectionId;
      if (this.peerConnection) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
      }
    });

    this.liveStreamService.onReceiveIceCandidate((candidate, fromConnectionId) => {
      if (fromConnectionId === this.viewerConnectionId && this.peerConnection) {
        this.peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
      }
    });

    this.liveStreamService.onError((message) => {
      this.errorMessage = message;
      this.status = 'Error';
    });
    this.liveStreamService.onViewerJoined(async (viewerConnectionId) => {

      console.log("Viewer joined event fired");
      console.log("Viewer Id:", viewerConnectionId);

      this.viewerConnectionId = viewerConnectionId;

      if (!this.peerConnection) {
        console.log('PeerConnection not ready');
        return;
      }

      const offer = await this.peerConnection.createOffer();

      await this.peerConnection.setLocalDescription(offer);

      console.log('Sending offer');

      await this.liveStreamService.sendOffer(JSON.stringify(offer), viewerConnectionId);
    });
  }

  async ngOnDestroy(): Promise<void> {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.peerConnection?.close();
    await this.liveStreamService.disconnect();
  }

  async startCamera(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.errorMessage = 'Camera access is not supported in this browser.';
      return;
    }

    this.errorMessage = '';
    this.status = 'Requesting camera access';

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (this.localVideo?.nativeElement) {
        this.localVideo.nativeElement.srcObject = this.localStream;
      }

      await this.liveStreamService.joinRoom('sender');
      await this.initializePeerConnection();
      this.isStreaming = true;
      this.status = 'Streaming to viewer';
    } catch (error) {
      this.errorMessage = 'Unable to start camera. Please allow camera and microphone access.';
      this.status = 'Camera blocked';
      console.error(error);
    }
  }

  private async initializePeerConnection(): Promise<void> {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.localStream?.getTracks().forEach((track) => {
      this.peerConnection?.addTrack(track, this.localStream!);
    });

    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        await this.liveStreamService.sendIceCandidate(JSON.stringify(event.candidate), this.viewerConnectionId ?? '');
      }
    };

    // this.peerConnection.onnegotiationneeded = async () => {
    //   if (!this.peerConnection || this.peerConnection.signalingState !== 'stable') {
    //     return;
    //   }

    //   const offer = await this.peerConnection.createOffer();
    //   await this.peerConnection.setLocalDescription(offer);
    //   await this.liveStreamService.sendOffer(JSON.stringify(offer));
    // };




  }
}
