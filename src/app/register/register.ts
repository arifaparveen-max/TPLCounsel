import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styles: `
    .auth-page {
      background: linear-gradient(120deg, rgba(18,21,24,0.96), rgba(17,18,22,0.90));
      color: #f8f7f2;
      min-height: calc(100vh - 120px);
      padding: 60px 0;
    }

    .auth-page .container {
      max-width: 680px;
      margin: 0 auto;
      padding: 32px;
      background: rgba(18,21,24,0.88);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
    }

    .section-header h2 {
      color: #ffffff;
      margin-bottom: 14px;
      font-size: 2rem;
      letter-spacing: 0.04em;
    }

    .section-header p {
      color: rgba(248,247,242,0.78);
      margin-bottom: 28px;
      line-height: 1.7;
    }

    .auth-form {
      display: grid;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .auth-form input,
    .auth-form textarea {
      width: 100%;
      min-height: 48px;
      padding: 14px 16px;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 12px;
      background: rgba(255,255,255,0.04);
      color: #f8f7f2;
      font-size: 0.95rem;
    }

    .auth-form input::placeholder,
    .auth-form textarea::placeholder {
      color: rgba(248,247,242,0.6);
    }

    .auth-form button.btn {
      min-height: 52px;
      border-radius: 999px;
      padding: 0 32px;
      color: #121518;
      background: #aa9166;
      border: none;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.25s ease;
    }

    .auth-form button.btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .auth-form button.btn:hover:not(:disabled) {
      background: #c9b08d;
    }

    .auth-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .auth-actions a {
      color: #aa9166;
      text-decoration: none;
      font-weight: 600;
    }

    .alert {
      padding: 14px 16px;
      border-radius: 12px;
      margin-top: 12px;
      font-size: 0.95rem;
    }

    .alert-success {
      background: rgba(66, 208, 132, 0.14);
      color: #c6ffdd;
    }

    .alert-danger {
      background: rgba(244, 67, 54, 0.12);
      color: #ffb3ab;
    }

    @media (max-width: 768px) {
      .auth-page {
        padding: 40px 0;
      }

      .auth-page .container {
        padding: 24px;
      }
    }
  `,
})
export class Register {
  username = '';
  email = '';
  password = '';
  fullName = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  private apiUrl = environment.baseUrl+'/Users/register';

  constructor(private http: HttpClient, private router: Router) {}

  submitForm(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.username || !this.email || !this.password || !this.fullName) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isSubmitting = true;

    const payload = {
      username: this.username,
      email: this.email,
      password: this.password,
      fullName: this.fullName,
    };

    this.http.post(this.apiUrl, payload).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Registered Successfully';
        this.username = '';
        this.email = '';
        this.password = '';
        this.fullName = '';
        setTimeout(() => this.router.navigate(['/login']), 1000);
      },
      error: (error: any) => {
        this.errorMessage = 'Registration failed. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }
}

