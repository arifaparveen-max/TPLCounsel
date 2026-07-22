import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';

interface ActSectionDtlsPayload {
  id?: number;
  sectionDtlId?: number;
  sectionId?: number | null;
  actId?: number | null;
  sectionNo?: number | null;
  chapterName?: string | null;
  bareAct?: string | null;
  meaning?: string | null;
  objective?: string | null;
  illustration?: string | null;
  exception?: string | null;
  caseStudyId?: number | null;
}

interface ActMasterOption {
  id?: number;
  actId?: number;
  actName?: string | null;
}

type EditableField = 'meaning' | 'objective' | 'illustration' | 'exception';

@Component({
  selector: 'app-act-sections-dtls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './act-sections-dtls.html',
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

    .form-control, .form-select, textarea {
      border-radius: 10px;
      border: 1px solid rgba(170, 145, 102, 0.35);
      padding: 10px 12px;
      background: #121518;
      color: #fff;
      width: 100%;
    }

    .editor-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }

    .editor-toolbar button {
      border: 1px solid rgba(170, 145, 102, 0.35);
      background: #121518;
      color: #fff;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 0.9rem;
    }

    .html-editor {
      min-height: 140px;
      border-radius: 10px;
      border: 1px solid rgba(170, 145, 102, 0.35);
      padding: 12px;
      background: #121518;
      color: #fff;
      width: 100%;
      overflow: auto;
    }

    .html-editor:focus {
      outline: none;
      border-color: #aa9166;
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
export class ActSectionsDtls implements OnInit {
  actSectionDtlsList: ActSectionDtlsPayload[] = [];
  actMasterOptions: ActMasterOption[] = [];
  sectionId: number | null = null;
  actId: number | null = null;
  sectionNo: number | null = null;
  chapterName = '';
  bareAct = '';
  meaning = '';
  objective = '';
  illustration = '';
  exception = '';
  caseStudyId: number | null = null;
  searchTerm = '';
  isSubmitting = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  editingActSectionDtlsId: number | null = null;
  activeEditor: EditableField = 'meaning';

  private readonly actSectionDtlsApiUrl = environment.baseUrl + '/ActSectionDtls';
  private readonly actMasterApiUrl = environment.baseUrl + '/ActMasters';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadActMasters();
    this.loadActSectionDtls();
  }

  submitForm(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (
      this.actId === null ||
      this.sectionNo === null ||
      this.caseStudyId === null ||
      !this.chapterName.trim() ||
      !this.bareAct.trim() ||
      !this.meaning.trim() ||
      !this.objective.trim() ||
      !this.illustration.trim() ||
      !this.exception.trim()
    ) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isSubmitting = true;

    const payload = this.buildPayload();
    const request$ = this.editingActSectionDtlsId
      ? this.http.put(`${this.actSectionDtlsApiUrl}/${this.editingActSectionDtlsId}`, payload, { headers: this.getAuthHeaders() })
      : this.http.post(this.actSectionDtlsApiUrl, payload, { headers: this.getAuthHeaders() });

    request$.pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: () => {
        this.successMessage = this.editingActSectionDtlsId ? 'Section details updated successfully.' : 'Section details created successfully.';
        this.resetForm();
        this.loadActSectionDtls();
      },
      error: () => {
        this.errorMessage = this.editingActSectionDtlsId ? 'Unable to update section details. Please try again.' : 'Unable to create section details. Please try again.';
      },
    });
  }

  editActSectionDtls(item: ActSectionDtlsPayload): void {
    const id = this.getRecordId(item);
    if (!id) {
      this.errorMessage = 'Unable to edit the selected record because no id was found.';
      return;
    }

    this.editingActSectionDtlsId = id;
    this.sectionId = this.resolveActMasterId(item.sectionId) ?? (item.sectionId ?? null);
    this.actId = this.resolveActMasterId(item.actId);
    this.sectionNo = this.resolveActMasterId(item.sectionNo) ?? (item.sectionNo ?? null);
    this.chapterName = item.chapterName ?? '';
    this.bareAct = item.bareAct ?? '';
    this.meaning = item.meaning ?? '';
    this.objective = item.objective ?? '';
    this.illustration = item.illustration ?? '';
    this.exception = item.exception ?? '';
    this.caseStudyId = this.resolveActMasterId(item.caseStudyId) ?? (item.caseStudyId ?? null);
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  deleteActSectionDtls(item: ActSectionDtlsPayload): void {
    const id = this.getRecordId(item);
    if (!id) {
      this.errorMessage = 'Unable to delete the selected record because no id was found.';
      return;
    }

    if (!window.confirm('Are you sure you want to delete this section detail record?')) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    this.http.delete(`${this.actSectionDtlsApiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: () => {
        this.successMessage = 'Section details deleted successfully.';
        if (this.editingActSectionDtlsId === id) {
          this.resetForm();
        }
        this.loadActSectionDtls();
      },
      error: () => {
        this.errorMessage = 'Unable to delete section details. Please try again.';
      },
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  focusEditor(field: EditableField): void {
    this.activeEditor = field;
    setTimeout(() => {
      const editor = document.querySelector(`[data-editor="${field}"]`) as HTMLElement | null;
      editor?.focus();
    }, 0);
  }

  applyEditorCommand(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.syncEditorValue(this.activeEditor);
  }

  setEditorValue(field: EditableField, event: Event): void {
    const target = event.target as HTMLElement | null;
    if (target) {
      this[field] = target.innerHTML;
    }
  }

  get filteredActSectionDtlsList(): ActSectionDtlsPayload[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.actSectionDtlsList.filter((item) => {
      const searchableText = [
        item.chapterName,
        item.bareAct,
        item.meaning,
        item.objective,
        item.illustration,
        item.exception,
        String(item.sectionNo ?? ''),
        String(item.sectionId ?? ''),
        String(item.actId ?? ''),
        String(item.caseStudyId ?? ''),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return !search || searchableText.includes(search);
    });
  }

  private buildPayload(): ActSectionDtlsPayload {
    return {
      sectionId: this.editingActSectionDtlsId ?? this.resolveActMasterId(this.sectionId) ?? 0,
      actId: this.resolveActMasterId(this.actId) ?? 0,
      sectionNo: this.resolveActMasterId(this.sectionNo) ?? 0,
      chapterName: this.chapterName.trim(),
      bareAct: this.bareAct.trim(),
      meaning: this.meaning.trim(),
      objective: this.objective.trim(),
      illustration: this.illustration.trim(),
      exception: this.exception.trim(),
      caseStudyId: this.resolveActMasterId(this.caseStudyId) ?? 0,
    };
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

  private loadActSectionDtls(): void {
    this.isLoading = true;

    this.http.get<unknown>(this.actSectionDtlsApiUrl, { headers: this.getAuthHeaders() }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (response) => {
        this.actSectionDtlsList = this.normalizeResponse(response);
      },
      error: () => {
        this.errorMessage = 'Unable to load section details.';
      },
    });
  }

  private normalizeResponse(response: unknown): ActSectionDtlsPayload[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is ActSectionDtlsPayload => this.isPayload(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];

      if (Array.isArray(data)) {
        return data.filter((item): item is ActSectionDtlsPayload => this.isPayload(item));
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

  private isPayload(value: unknown): value is ActSectionDtlsPayload {
    return Boolean(value && typeof value === 'object' && ('chapterName' in value || 'bareAct' in value));
  }

  private isActMasterOption(value: unknown): value is ActMasterOption {
    return Boolean(value && typeof value === 'object' && ('actName' in value || 'actId' in value || 'id' in value));
  }

  private syncEditorValue(field: EditableField): void {
    const editor = document.querySelector(`[data-editor="${field}"]`) as HTMLElement | null;
    if (editor) {
      this[field] = editor.innerHTML;
    }
  }

  private resetForm(): void {
    this.sectionId = null;
    this.actId = null;
    this.sectionNo = null;
    this.chapterName = '';
    this.bareAct = '';
    this.meaning = '';
    this.objective = '';
    this.illustration = '';
    this.exception = '';
    this.caseStudyId = null;
    this.editingActSectionDtlsId = null;
  }

  getActMasterDisplayName(value: number | string | null | undefined): string {
    const actId = this.resolveActMasterId(value);
    const match = this.actMasterOptions.find((item) => (item.actId ?? item.id) === actId);

    if (match?.actName?.trim()) {
      return match.actName.trim();
    }

    return typeof value === 'string' && value.trim() ? value : '';
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

  private getRecordId(item: ActSectionDtlsPayload): number | null {
    return item.id ?? item.sectionDtlId ?? item.sectionId ?? null;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getBearerToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });
  }
}
