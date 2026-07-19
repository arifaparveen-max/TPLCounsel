import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import {environment} from '../../environments/environment'
interface ActMasterPayload {
  id?: number;
  actId?: number;
  actName: string;
  alias: string;
  dateOfEffect?: string | null;
  actDetails?: string | null;
  legalCategoryId?: number | null;
  imagePath?: string | null;
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
  actId=0;
  alias = '';
  dateOfEffect = '';
  actDetails = '';
  legalCategoryId: number | '' = '';
  imagePath = '';
  selectedImageFile: File | null = null;
  isSubmitting = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  editingActId: number | null = null;

  private readonly actApiUrl = environment.baseUrl +'/ActMasters';
  private readonly legalCategoryApiUrl = environment.baseUrl +'/LegalCategoryMasters';

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

    const formData = new FormData();
    if (this.editingActId!=null && this.editingActId!=0)
    {
      formData.append('actId', String(Number(this.editingActId)));
    }
     
    formData.append('actName', this.actName.trim());
    formData.append('alias', this.alias.trim());
    formData.append('dateOfEffect', this.dateOfEffect);
    formData.append('actDetails', this.actDetails.trim());
    formData.append('legalCategoryId', String(Number(this.legalCategoryId)));
    formData.append('imagePath', this.imagePath.trim() || (this.selectedImageFile ? this.selectedImageFile.name : ''));

    if (this.selectedImageFile) {
      formData.append('actImage', this.selectedImageFile, this.selectedImageFile.name);
    }

    const request$ = this.editingActId
      ? this.http.put(`${this.actApiUrl}/${this.editingActId}`, formData, { headers: this.getAuthHeaders() })
      : this.http.post(this.actApiUrl, formData, { headers: this.getAuthHeaders() });

    request$.pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.successMessage = this.editingActId ? 'Act updated successfully.' : 'Act created successfully.';
        this.resetForm();
        this.loadActs();
      },
      error: (error: any) => {
        this.errorMessage = this.editingActId ? 'Unable to update act. Please try again.' : 'Unable to create act. Please try again.';
        console.error('Act save error:', error);
      },
    });
  }

  editAct(item: ActMasterPayload): void {
    const actId = this.getActId(item);
    if (!actId) {
      this.errorMessage = 'Unable to edit the selected act because no id was found.';
      return;
    }

    this.editingActId = actId;
    this.actName = item.actName || '';
    this.alias = item.alias || '';
    this.dateOfEffect = item.dateOfEffect || '';
    this.actDetails = item.actDetails || '';
    this.legalCategoryId = item.legalCategoryId ?? '';
    this.imagePath = item.imagePath || '';
    this.selectedImageFile = null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  deleteAct(item: ActMasterPayload): void {
    const actId = this.getActId(item);
    if (!actId) {
      this.errorMessage = 'Unable to delete the selected act because no id was found.';
      return;
    }

    if (!window.confirm('Are you sure you want to delete this act?')) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    this.http.delete(`${this.actApiUrl}/${actId}`, { headers: this.getAuthHeaders() }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Act deleted successfully.';
        if (this.editingActId === actId) {
          this.resetForm();
        }
        this.loadActs();
      },
      error: (error: any) => {
        this.errorMessage = 'Unable to delete act. Please try again.';
        console.error('Delete act error:', error);
      },
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  onImageSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    this.selectedImageFile = file;
    this.imagePath = file.name;
  }

  getCategoryName(legalCategoryId?: number | null): string {
    if (!legalCategoryId) {
      return '—';
    }

    const category = this.legalCategories.find((item) => (item.id ?? item.categoryId) === legalCategoryId);
    return category?.categoryName || '—';
  }

  private getActId(item: ActMasterPayload): number | null {
    return item.id ?? item.actId ?? null;
  }

  private resetForm(): void {
    this.actName = '';
    this.alias = '';
    this.dateOfEffect = '';
    this.actDetails = '';
    this.legalCategoryId = '';
    this.imagePath = '';
    this.selectedImageFile = null;
    this.editingActId = null;
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
    });
  }
}
