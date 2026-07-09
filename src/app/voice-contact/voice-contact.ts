import { Component } from '@angular/core';

@Component({
  selector: 'app-voice-contact',
  imports: [],
  templateUrl: './voice-contact.html',
  styles: ``,
})
export class VoiceContact {

  recognizedText = '';

recognition:any;

ngOnInit(){

const SpeechRecognition =
(window as any).SpeechRecognition ||
(window as any).webkitSpeechRecognition;

this.recognition = new SpeechRecognition();

this.recognition.lang='en-US';

this.recognition.continuous=false;

this.recognition.onresult=(event:any)=>{

this.recognizedText =
event.results[0][0].transcript;

};

}

startListening(){

this.recognition.start();

}
}
