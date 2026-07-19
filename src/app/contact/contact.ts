import { Component, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Footer } from "../footer/footer";
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-contact',
  imports: [Footer, CommonModule, FormsModule],
  templateUrl: './contact.html',
  styles: ``,
})
export class Contact {
  clientName: string = '';
  clientEmail: string = '';
  subject: string = '';
  message: string = '';
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  private apiUrl = environment.baseUrl+'/Emails/send';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  submitForm(): void {
    // Reset messages
    this.successMessage = '';
    this.errorMessage = '';

    // Validate form
    if (!this.clientName || !this.clientEmail || !this.subject || !this.message) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isSubmitting = true;

    const emailData = {
      clientName: this.clientName,
      clientEmail: this.clientEmail,
      subject: this.subject,
      message: this.message
    };

    this.http.post(this.apiUrl, emailData).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        console.log('Zone:', NgZone.isInAngularZone());
        this.successMessage = 'Your message has been sent successfully!';
        // Reset form fields
        this.clientName = '';
        this.clientEmail = '';
        this.subject = '';
        this.message = '';
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to send message. Please try again.';
        console.error('Error sending email:', error);
      }
    });
  }
}
