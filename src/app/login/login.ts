import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styles: `
    .auth-page {
      background: linear-gradient(120deg, rgba(18,21,24,0.96), rgba(17,18,22,0.90));
      color: #f8f7f2;
      min-height: calc(100vh - 120px);
      padding: 60px 0;
    }

    .auth-page .container {
      max-width: 620px;
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

    .auth-form input {
      width: 100%;
      min-height: 48px;
      padding: 14px 16px;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 12px;
      background: rgba(255,255,255,0.04);
      color: #f8f7f2;
      font-size: 0.95rem;
    }

    .auth-form input::placeholder {
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

    .auth-form button.btn:hover {
      background: #c9b08d;
    }

    .auth-cta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .auth-cta a {
      color: #aa9166;
      text-decoration: none;
      font-weight: 600;
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
export class Login {
  email = '';
  password = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  submitForm(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in both fields.';
      return;
    }

    this.isSubmitting = true;

    this.auth.login(this.email, this.password).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Login Successfully';
        setTimeout(() => this.router.navigate(['/pages']), 1000);
      },
      error: (error: any) => {
        this.errorMessage = 'Login failed. Please check your credentials.';
        console.error('Login error:', error);
      }
    });
  }
}

