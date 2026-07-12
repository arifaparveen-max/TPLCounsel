import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth.service';

interface ActMasterPayload {
  actId?: number;
  actName: string;
  alias: string;
  dateOfEffect?: string | null;
  actDetails?: string | null;
  legalCategoryId?: number | null;
}

interface LegalCategoryOption {
  id?: number;
  categoryId?: number;
  categoryName: string;
}

@Component({
  selector: 'app-act-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './act-master.html',
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
export class ActMaster implements OnInit {
  acts: ActMasterPayload[] = [];
  legalCategories: LegalCategoryOption[] = [];
  actName = '';
  alias = '';
  dateOfEffect = '';
  actDetails = '';
  legalCategoryId: number | '' = '';
  isSubmitting = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  private readonly actApiUrl = 'https://employeesapi.runasp.net/api/ActMasters';
  private readonly legalCategoryApiUrl = 'https://employeesapi.runasp.net/api/LegalCategoryMasters';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadLegalCategories();
    this.loadActs();
  }

  submitForm(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.actName || !this.alias || !this.dateOfEffect || !this.actDetails || this.legalCategoryId === '') {
      this.errorMessage = 'Please fill in all fields and choose a legal category.';
      return;
    }

    this.isSubmitting = true;

    const payload = {
      actName: this.actName.trim(),
      alias: this.alias.trim(),
      dateOfEffect: this.dateOfEffect,
      actDetails: this.actDetails.trim(),
      legalCategoryId: Number(this.legalCategoryId),
    };

    this.http.post(this.actApiUrl, payload, { headers: this.getAuthHeaders() }).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Act created successfully.';
        this.actName = '';
        this.alias = '';
        this.dateOfEffect = '';
        this.actDetails = '';
        this.legalCategoryId = '';
        this.loadActs();
      },
      error: (error: any) => {
        this.errorMessage = 'Unable to create act. Please try again.';
        console.error('Create act error:', error);
      },
    });
  }

  getCategoryName(legalCategoryId?: number | null): string {
    if (!legalCategoryId) {
      return '—';
    }

    const category = this.legalCategories.find((item) => (item.id ?? item.categoryId) === legalCategoryId);
    return category?.categoryName || '—';
  }

  private loadActs(): void {
    this.isLoading = true;

    this.http.get<unknown>(this.actApiUrl, { headers: this.getAuthHeaders() }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        this.acts = this.normalizeActsResponse(response);
      },
      error: (error: any) => {
        this.errorMessage = 'Unable to load acts.';
        console.error('Load acts error:', error);
      },
    });
  }

  private loadLegalCategories(): void {
    this.http.get<unknown>(this.legalCategoryApiUrl, { headers: this.getAuthHeaders() }).subscribe({
      next: (response) => {
        this.legalCategories = this.normalizeLegalCategoriesResponse(response);
      },
      error: (error: any) => {
        console.error('Load legal categories error:', error);
      },
    });
  }

  private normalizeActsResponse(response: unknown): ActMasterPayload[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is ActMasterPayload => this.isActPayload(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];

      if (Array.isArray(data)) {
        return data.filter((item): item is ActMasterPayload => this.isActPayload(item));
      }
    }

    return [];
  }

  private normalizeLegalCategoriesResponse(response: unknown): LegalCategoryOption[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.mapLegalCategory(item)).filter((item): item is LegalCategoryOption => Boolean(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];

      if (Array.isArray(data)) {
        return data.map((item) => this.mapLegalCategory(item)).filter((item): item is LegalCategoryOption => Boolean(item));
      }
    }

    return [];
  }

  private mapLegalCategory(value: unknown): LegalCategoryOption | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const item = value as Record<string, unknown>;
    const categoryName = this.getStringValue(item['categoryName']) || this.getStringValue(item['name']) || this.getStringValue(item['CategoryName']);

    if (!categoryName) {
      return null;
    }

    return {
      id: this.getNumberValue(item['id']) ?? this.getNumberValue(item['categoryId']),
      categoryId: this.getNumberValue(item['categoryId']) ?? this.getNumberValue(item['id']),
      categoryName,
    };
  }

  private isActPayload(value: unknown): value is ActMasterPayload {
    return Boolean(
      value &&
        typeof value === 'object' &&
        'actName' in value &&
        'alias' in value
    );
  }

  private getStringValue(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
  }

  private getNumberValue(value: unknown): number | undefined {
    return typeof value === 'number' ? value : undefined;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getBearerToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
      'Content-Type': 'application/json',
    });
  }
}
