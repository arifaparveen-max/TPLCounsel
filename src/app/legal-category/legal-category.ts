import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment.prod';

interface LegalCategoryPayload {
  id?: number;
  categoryId?: number;
  categoryName: string;
  alias: string;
  description: string;
  categoryIconPath: string;
  iconClass: string;
}

@Component({
  selector: 'app-legal-category',
  imports: [CommonModule, FormsModule],
  templateUrl: './legal-category.html',
  styles: `
    .page-shell {
      padding: 40px 0 80px;
      background: linear-gradient(120deg, rgba(18,21,24,0.96), rgba(17,18,22,0.9));
      color: #f8f7f2;
      min-height: calc(100vh - 120px);
    }

    .card {
      background: rgba(18,21,24,0.9);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      box-shadow: 0 16px 45px rgba(0,0,0,0.24);
    }

    .table-dark {
      --bs-table-bg: rgba(255,255,255,0.03);
      --bs-table-color: #f8f7f2;
      --bs-table-border-color: rgba(255,255,255,0.1);
    }

    .form-control, .form-select {
      background: rgba(255,255,255,0.04);
      color: #f8f7f2;
      border: 1px solid rgba(255,255,255,0.14);
    }

    .form-control::placeholder {
      color: rgba(248,247,242,0.6);
    }

    .btn-gold {
      background: #aa9166;
      border: none;
      color: #121518;
      font-weight: 700;
    }

    .btn-gold:hover {
      background: #c9b08d;
      color: #121518;
    }
  `,
})
export class LegalCategory implements OnInit {
  categories: LegalCategoryPayload[] = [];
  categoryName = '';
  alias = '';
  description = '';
  categoryIconPath = '';
  iconClass = '';
  isSubmitting = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  private readonly apiUrl = environment.baseUrl+ '/LegalCategoryMasters';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  deleteCategory(item: LegalCategoryPayload): void {
    const categoryId = item.id ?? item.categoryId;

    if (!categoryId) {
      this.errorMessage = 'Unable to delete the selected category because no id was found.';
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    this.http.delete(`${this.apiUrl}/${categoryId}`, { headers: this.getAuthHeaders() }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Legal category deleted successfully.';
        this.loadCategories();
      },
      error: (error: any) => {
        this.errorMessage = 'Unable to delete legal category. Please try again.';
        console.error('Delete legal category error:', error);
      },
    });
  }

  submitForm(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.categoryName || !this.alias || !this.description) {
      this.errorMessage = 'Please fill in category name, alias and description.';
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('categoryName', this.categoryName);
    formData.append('alias', this.alias);
    formData.append('description', this.description);
    formData.append('categoryIconPath', this.categoryIconPath || '');
    formData.append('iconClass', this.iconClass || '');

    this.http.post(this.apiUrl, formData, { headers: this.getAuthHeaders() }).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Legal category created successfully.';
        this.categoryName = '';
        this.alias = '';
        this.description = '';
        this.categoryIconPath = '';
        this.iconClass = '';
        this.loadCategories();
      },
      error: (error: any) => {
        this.errorMessage = 'Unable to create legal category. Please try again.';
        console.error('Create legal category error:', error);
      },
    });
  }

  private loadCategories(): void {
    this.isLoading = true;

    this.http.get<unknown>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        const payload = this.normalizeCategoriesResponse(response);
        this.categories = payload;
      },
      error: (error: any) => {
        this.errorMessage = 'Unable to load legal categories.';
        console.error('Load legal categories error:', error);
      },
    });
  }

  private normalizeCategoriesResponse(response: unknown): LegalCategoryPayload[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is LegalCategoryPayload => this.isLegalCategoryPayload(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];

      if (Array.isArray(data)) {
        return data.filter((item): item is LegalCategoryPayload => this.isLegalCategoryPayload(item));
      }

      if (candidate['categories'] && Array.isArray(candidate['categories'])) {
        return candidate['categories'].filter((item): item is LegalCategoryPayload => this.isLegalCategoryPayload(item));
      }
    }

    return [];
  }

  private isLegalCategoryPayload(value: unknown): value is LegalCategoryPayload {
    return Boolean(
      value &&
        typeof value === 'object' &&
        'categoryName' in value &&
        'alias' in value &&
        'description' in value
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getBearerToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });
  }
}
