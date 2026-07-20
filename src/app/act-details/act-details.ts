import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';

interface ActDetailsPayload {
  id?: number;
  section: string;
  offence: string;
  punishment: string;
  cognizableOrNon_Cognizable: string;
  bailableOrNon_Bailable: string;
  trialCourt: string;
  actName?: number | string | null;
  createdOn?: string | null;
  createdBy?: string | null;
  modifiedOn?: string | null;
  modifeidBy?: string | null;
}

interface ActMasterOption {
  id?: number;
  actId?: number;
  actName: string;
}

@Component({
  selector: 'app-act-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './act-details.html',
  styles: `
    .admin-panel {
      padding: 60px 24px;
      max-width: 1200px;
      margin: 0 auto;
      color: #fff;
      background: linear-gradient(135deg, #121518 0%, #000000 100%);
    }

    .section-header h2 {
      margin-bottom: 16px;
      font-size: 2rem;
      color: #aa9166;
    }

    .section-header p {
      color: #f5f5f5;
      margin-bottom: 28px;
      line-height: 1.7;
    }

    .panel-card {
      background: #000000;
      color: #fff;
      border-radius: 18px;
      border: 1px solid rgba(170, 145, 102, 0.35);
      padding: 32px;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
      margin-bottom: 24px;
    }

    .form-control, .form-select {
      border-radius: 10px;
      border: 1px solid rgba(170, 145, 102, 0.35);
      padding: 10px 12px;
      background: #121518;
      color: #fff;
    }

    .form-control::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    .table-responsive {
      overflow-x: auto;
    }

    .table {
      color: #fff;
    }

    .table thead th {
      background: #aa9166;
      color: #121518;
    }

    .table tbody tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.04);
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
export class ActDetails implements OnInit {
  actDetailsList: ActDetailsPayload[] = [];
  actMasterOptions: ActMasterOption[] = [];
  section = '';
  offence = '';
  punishment = '';
  cognizableOrNon_Cognizable = '';
  bailableOrNon_Bailable = '';
  trialCourt = '';
  selectedActMasterId: number | null = null;
  searchTerm = '';
  selectedActFilterId: number | null = null;
  isSubmitting = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  editingActDetailId: number | null = null;

  private readonly actApiUrl = environment.baseUrl + '/ActDetails';
  private readonly actMasterApiUrl = environment.baseUrl + '/ActMasters';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadActMasters();
    this.loadActDetails();
  }

  submitForm(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.section || !this.offence || !this.punishment || !this.cognizableOrNon_Cognizable || !this.bailableOrNon_Bailable || !this.trialCourt || this.selectedActMasterId === null) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isSubmitting = true;

    const payload = this.buildPayload();
    const request$ = this.editingActDetailId
      ? this.http.put(`${this.actApiUrl}/${this.editingActDetailId}`, payload, { headers: this.getAuthHeaders() })
      : this.http.post(this.actApiUrl, payload, { headers: this.getAuthHeaders() });

    request$.pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: () => {
        this.successMessage = this.editingActDetailId ? 'Act detail updated successfully.' : 'Act detail created successfully.';
        this.resetForm();
        this.loadActDetails();
      },
      error: () => {
        this.errorMessage = this.editingActDetailId ? 'Unable to update act detail. Please try again.' : 'Unable to create act detail. Please try again.';
      },
    });
  }

  editActDetail(item: ActDetailsPayload): void {
    const actDetailId = this.getActDetailId(item);
    if (!actDetailId) {
      this.errorMessage = 'Unable to edit the selected record because no id was found.';
      return;
    }

    this.editingActDetailId = actDetailId;
    this.section = item.section || '';
    this.offence = item.offence || '';
    this.punishment = item.punishment || '';
    this.cognizableOrNon_Cognizable = item.cognizableOrNon_Cognizable || '';
    this.bailableOrNon_Bailable = item.bailableOrNon_Bailable || '';
    this.trialCourt = item.trialCourt || '';
    this.selectedActMasterId = this.resolveActMasterId(item.actName);
    this.successMessage = '';
    this.errorMessage = '';
  }

  deleteActDetail(item: ActDetailsPayload): void {
    const actDetailId = this.getActDetailId(item);
    if (!actDetailId) {
      this.errorMessage = 'Unable to delete the selected record because no id was found.';
      return;
    }

    if (!window.confirm('Are you sure you want to delete this act detail record?')) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    this.http.delete(`${this.actApiUrl}/${actDetailId}`, { headers: this.getAuthHeaders() }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: () => {
        this.successMessage = 'Act detail deleted successfully.';
        if (this.editingActDetailId === actDetailId) {
          this.resetForm();
        }
        this.loadActDetails();
      },
      error: () => {
        this.errorMessage = 'Unable to delete act detail. Please try again.';
      },
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private buildPayload(): FormData {
    const payload = new FormData();

    if (this.editingActDetailId != null && this.editingActDetailId !== 0) {
      payload.append('id', String(this.editingActDetailId));
    }

    payload.append('section', this.section.trim());
    payload.append('offence', this.offence.trim());
    payload.append('punishment', this.punishment.trim());
    payload.append('cognizableOrNon_Cognizable', this.cognizableOrNon_Cognizable.trim());
    payload.append('bailableOrNon_Bailable', this.bailableOrNon_Bailable.trim());
    payload.append('trialCourt', this.trialCourt.trim());
    payload.append('actName', String(this.selectedActMasterId ?? ''));

    return payload;
  }

  get filteredActDetailsList(): ActDetailsPayload[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.actDetailsList.filter((item) => {
      const searchableText = [
        item.section,
        item.offence,
        item.punishment,
        item.cognizableOrNon_Cognizable,
        item.bailableOrNon_Bailable,
        item.trialCourt,
        this.getActMasterDisplayName(item.actName),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !search || searchableText.includes(search);
      const matchesActMaster = this.selectedActFilterId === null || this.resolveActMasterId(item.actName) === this.selectedActFilterId;

      return matchesSearch && matchesActMaster;
    });
  }

  private loadActDetails(): void {
    this.isLoading = true;

    this.http.get<unknown>(this.actApiUrl, { headers: this.getAuthHeaders() }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (response) => {
        this.actDetailsList = this.normalizeActDetailsResponse(response);
      },
      error: () => {
        this.errorMessage = 'Unable to load act details.';
      },
    });
  }

  private loadActMasters(): void {
    this.http.get<unknown>(this.actMasterApiUrl, { headers: this.getAuthHeaders() }).subscribe({
      next: (response) => {
        this.actMasterOptions = this.normalizeActMastersResponse(response);
      },
      error: () => {
        this.errorMessage = 'Unable to load act masters.';
      },
    });
  }

  getActMasterDisplayName(value: number | string | null | undefined): string {
    const actMasterId = this.resolveActMasterId(value);
    const match = this.actMasterOptions.find((item) => (item.id ?? item.actId) === actMasterId);

    if (match?.actName) {
      return match.actName;
    }

    return typeof value === 'string' && value.trim() ? value : '';
  }

  private normalizeActDetailsResponse(response: unknown): ActDetailsPayload[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is ActDetailsPayload => this.isActDetailsPayload(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];

      if (Array.isArray(data)) {
        return data.filter((item): item is ActDetailsPayload => this.isActDetailsPayload(item));
      }
    }

    return [];
  }

  private normalizeActMastersResponse(response: unknown): ActMasterOption[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is ActMasterOption => this.isActMasterOption(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];

      if (Array.isArray(data)) {
        return data.filter((item): item is ActMasterOption => this.isActMasterOption(item));
      }
    }

    return [];
  }

  private isActDetailsPayload(value: unknown): value is ActDetailsPayload {
    return Boolean(
      value &&
        typeof value === 'object' &&
        'section' in value &&
        'offence' in value &&
        'punishment' in value,
    );
  }

  private isActMasterOption(value: unknown): value is ActMasterOption {
    return Boolean(value && typeof value === 'object' && 'actName' in value);
  }

  private resolveActMasterId(value: number | string | null | undefined): number | null {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private resetForm(): void {
    this.section = '';
    this.offence = '';
    this.punishment = '';
    this.cognizableOrNon_Cognizable = '';
    this.bailableOrNon_Bailable = '';
    this.trialCourt = '';
    this.selectedActMasterId = null;
    this.editingActDetailId = null;
  }

  private getActDetailId(item: ActDetailsPayload): number | null {
    return item.id ?? null;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getBearerToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });
  }
}
