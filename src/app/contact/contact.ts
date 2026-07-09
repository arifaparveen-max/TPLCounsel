import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from "../footer/footer";

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

  private apiUrl = 'https://employeesapi.runasp.net/api/Emails/send';

  constructor(private http: HttpClient) {}

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

    this.http.post(this.apiUrl, emailData).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.successMessage = 'Your message has been sent successfully!';
        // Reset form
        this.clientName = '';
        this.clientEmail = '';
        this.subject = '';
        this.message = '';
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to send message. Please try again.';
        console.error('Error sending email:', error);
      }
    });
  }
}
