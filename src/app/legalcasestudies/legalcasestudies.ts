import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';

interface LegalCaseStudyPayload {
  id?: number;
  caseName?: string | null;
  imagePath?: string | null;
  caseImage?: string | null;
  caseTitleAndCitation?: string | null;
  factsOfTheCase?: string | null;
  proceduralHistory?: string | null;
  legalIssues?: string | null;
  argumentsOfTheParties?: string | null;
  relevantLaw?: string | null;
  courtsAnalysis?: string | null;
  judgment_Holding?: string | null;
  criticalAnalysis?: string | null;
  impactOfTheJudgment?: string | null;
  conclusion?: string | null;
  references?: string | null;
  createdOn?: string | null;
  updatedOn?: string | null;
}

type EditableField =
  | 'caseTitleAndCitation'
  | 'factsOfTheCase'
  | 'proceduralHistory'
  | 'legalIssues'
  | 'argumentsOfTheParties'
  | 'relevantLaw'
  | 'courtsAnalysis'
  | 'judgment_Holding'
  | 'criticalAnalysis'
  | 'impactOfTheJudgment'
  | 'conclusion'
  | 'references';

@Component({
  selector: 'app-legalcasestudies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './legalcasestudies.html',
  styles: `
    .admin-panel {
      padding: 60px 24px;
      max-width: 1400px;
      margin: 0 auto;
      color: #111;
      background: linear-gradient(135deg, #f7f3eb 0%, #ffffff 100%);
    }

    .section-header h2 {
      margin-bottom: 12px;
      color: #aa9166;
      font-size: 2rem;
    }

    .section-header p {
      color: #4f4f4f;
      margin-bottom: 28px;
      line-height: 1.7;
    }

    .panel-card {
      background: #fff;
      color: #111;
      border-radius: 18px;
      border: 1px solid rgba(170, 145, 102, 0.25);
      padding: 28px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.07);
      margin-bottom: 24px;
    }

    .form-control, .form-select, textarea {
      border-radius: 10px;
      border: 1px solid rgba(170, 145, 102, 0.35);
      padding: 10px 12px;
      background: #fff;
      color: #111;
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
      background: #fff;
      color: #111;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 0.9rem;
    }

    .html-editor {
      min-height: 140px;
      border-radius: 10px;
      border: 1px solid rgba(170, 145, 102, 0.35);
      padding: 12px;
      background: #fff;
      color: #111;
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

    .table thead th {
      background: #aa9166;
      color: #fff;
    }

    .btn-gold {
      background: #aa9166;
      border: none;
      color: #fff;
      font-weight: 700;
    }

    .btn-gold:hover {
      background: #c9b08d;
      color: #fff;
    }
  `,
})
export class LegalCaseStudies implements OnInit {
  caseStudies: LegalCaseStudyPayload[] = [];
  searchTerm = '';
  isSubmitting = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  editingCaseStudyId: number | null = null;
  activeEditor: EditableField = 'caseTitleAndCitation';

  caseName = '';
  imagePath = '';
  selectedCaseImageFile: File | null = null;
  caseTitleAndCitation = '';
  factsOfTheCase = '';
  proceduralHistory = '';
  legalIssues = '';
  argumentsOfTheParties = '';
  relevantLaw = '';
  courtsAnalysis = '';
  judgment_Holding = '';
  criticalAnalysis = '';
  impactOfTheJudgment = '';
  conclusion = '';
  references = '';

  readonly editorFields: Array<{ key: EditableField; label: string }> = [
    { key: 'caseTitleAndCitation', label: 'Case Title and Citation' },
    { key: 'factsOfTheCase', label: 'Facts of the Case' },
    { key: 'proceduralHistory', label: 'Procedural History' },
    { key: 'legalIssues', label: 'Legal Issues' },
    { key: 'argumentsOfTheParties', label: 'Arguments of the Parties' },
    { key: 'relevantLaw', label: 'Relevant Law' },
    { key: 'courtsAnalysis', label: 'Court\'s Analysis' },
    { key: 'judgment_Holding', label: 'Judgment / Holding' },
    { key: 'criticalAnalysis', label: 'Critical Analysis' },
    { key: 'impactOfTheJudgment', label: 'Impact of the Judgment' },
    { key: 'conclusion', label: 'Conclusion' },
    { key: 'references', label: 'References' },
  ];

  private readonly legalCaseStudiesApiUrl = environment.baseUrl + '/LegalCaseStudies';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCaseStudies();
  }

  submitForm(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.caseName.trim() || !this.caseTitleAndCitation.trim() || !this.factsOfTheCase.trim() || !this.legalIssues.trim() || !this.argumentsOfTheParties.trim() || !this.relevantLaw.trim() || !this.courtsAnalysis.trim() || !this.judgment_Holding.trim() || !this.criticalAnalysis.trim() || !this.impactOfTheJudgment.trim() || !this.conclusion.trim() || !this.references.trim()) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isSubmitting = true;
    const formData = this.buildFormData();
    const request$ = this.editingCaseStudyId
      ? this.http.put(`${this.legalCaseStudiesApiUrl}/${this.editingCaseStudyId}`, formData, { headers: this.getAuthHeaders('form-data') })
      : this.http.post(this.legalCaseStudiesApiUrl, formData, { headers: this.getAuthHeaders('form-data') });

    request$.pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: () => {
        this.successMessage = this.editingCaseStudyId ? 'Legal case study updated successfully.' : 'Legal case study created successfully.';
        this.resetForm();
        this.loadCaseStudies();
      },
      error: () => {
        this.errorMessage = this.editingCaseStudyId ? 'Unable to update legal case study.' : 'Unable to create legal case study.';
      },
    });
  }

  editCaseStudy(item: LegalCaseStudyPayload): void {
    const id = item.id ?? null;
    if (!id) {
      this.errorMessage = 'Unable to edit the selected record because no id was found.';
      return;
    }

    this.editingCaseStudyId = id;
    this.caseName = item.caseName ?? '';
    this.imagePath = item.imagePath ?? '';
    this.selectedCaseImageFile = null;
    this.caseTitleAndCitation = item.caseTitleAndCitation ?? '';
    this.factsOfTheCase = item.factsOfTheCase ?? '';
    this.proceduralHistory = item.proceduralHistory ?? '';
    this.legalIssues = item.legalIssues ?? '';
    this.argumentsOfTheParties = item.argumentsOfTheParties ?? '';
    this.relevantLaw = item.relevantLaw ?? '';
    this.courtsAnalysis = item.courtsAnalysis ?? '';
    this.judgment_Holding = item.judgment_Holding ?? '';
    this.criticalAnalysis = item.criticalAnalysis ?? '';
    this.impactOfTheJudgment = item.impactOfTheJudgment ?? '';
    this.conclusion = item.conclusion ?? '';
    this.references = item.references ?? '';
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  deleteCaseStudy(item: LegalCaseStudyPayload): void {
    const id = item.id ?? null;
    if (!id) {
      this.errorMessage = 'Unable to delete the selected record because no id was found.';
      return;
    }

    if (!window.confirm('Are you sure you want to delete this legal case study?')) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    this.http.delete(`${this.legalCaseStudiesApiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: () => {
        this.successMessage = 'Legal case study deleted successfully.';
        if (this.editingCaseStudyId === id) {
          this.resetForm();
        }
        this.loadCaseStudies();
      },
      error: () => {
        this.errorMessage = 'Unable to delete legal case study.';
      },
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  onImageSelected(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0];

    if (!file) {
      return;
    }

    this.selectedCaseImageFile = file;
    this.imagePath = file.name;
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

  get filteredCaseStudies(): LegalCaseStudyPayload[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.caseStudies;
    }

    return this.caseStudies.filter((item) => {
      const searchableText = [
        item.caseName,
        item.caseTitleAndCitation,
        item.factsOfTheCase,
        item.proceduralHistory,
        item.legalIssues,
        item.argumentsOfTheParties,
        item.relevantLaw,
        item.courtsAnalysis,
        item.judgment_Holding,
        item.criticalAnalysis,
        item.impactOfTheJudgment,
        item.conclusion,
        item.references,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(search);
    });
  }

  getCaseStudyTitle(item: LegalCaseStudyPayload): string {
    return this.toPlainText(item.caseName) || this.toPlainText(item.caseTitleAndCitation) || 'Untitled case';
  }

  getCaseStudyPreview(item: LegalCaseStudyPayload): string {
    const previewSource = this.toPlainText(item.factsOfTheCase) || this.toPlainText(item.legalIssues) || this.toPlainText(item.caseName) || this.toPlainText(item.caseTitleAndCitation);
    const preview = previewSource.replace(/\s+/g, ' ').trim();
    return preview.length > 120 ? `${preview.substring(0, 120)}...` : preview;
  }

  private buildFormData(): FormData {
    const formData = new FormData();

    if (this.editingCaseStudyId != null) {
      formData.append('id', String(this.editingCaseStudyId));
    }

    formData.append('caseName', this.caseName.trim());
    formData.append('imagePath', this.imagePath.trim() || (this.selectedCaseImageFile ? this.selectedCaseImageFile.name : ''));
    formData.append('caseTitleAndCitation', this.caseTitleAndCitation.trim());
    formData.append('factsOfTheCase', this.factsOfTheCase.trim());
    formData.append('proceduralHistory', this.proceduralHistory.trim());
    formData.append('legalIssues', this.legalIssues.trim());
    formData.append('argumentsOfTheParties', this.argumentsOfTheParties.trim());
    formData.append('relevantLaw', this.relevantLaw.trim());
    formData.append('courtsAnalysis', this.courtsAnalysis.trim());
    formData.append('judgment_Holding', this.judgment_Holding.trim());
    formData.append('criticalAnalysis', this.criticalAnalysis.trim());
    formData.append('impactOfTheJudgment', this.impactOfTheJudgment.trim());
    formData.append('conclusion', this.conclusion.trim());
    formData.append('references', this.references.trim());
    formData.append('updatedOn', new Date().toISOString());

    if (this.selectedCaseImageFile) {
      formData.append('caseImage', this.selectedCaseImageFile, this.selectedCaseImageFile.name);
    }

    return formData;
  }

  private loadCaseStudies(): void {
    this.isLoading = true;

    this.http.get<unknown>(this.legalCaseStudiesApiUrl, { headers: this.getAuthHeaders() }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (response) => {
        this.caseStudies = this.normalizeResponse(response);
      },
      error: () => {
        this.errorMessage = 'Unable to load legal case studies.';
      },
    });
  }

  private resetForm(): void {
    this.editingCaseStudyId = null;
    this.caseName = '';
    this.imagePath = '';
    this.selectedCaseImageFile = null;
    this.caseTitleAndCitation = '';
    this.factsOfTheCase = '';
    this.proceduralHistory = '';
    this.legalIssues = '';
    this.argumentsOfTheParties = '';
    this.relevantLaw = '';
    this.courtsAnalysis = '';
    this.judgment_Holding = '';
    this.criticalAnalysis = '';
    this.impactOfTheJudgment = '';
    this.conclusion = '';
    this.references = '';
    this.activeEditor = 'caseTitleAndCitation';
  }

  private normalizeResponse(response: unknown): LegalCaseStudyPayload[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is LegalCaseStudyPayload => this.isPayload(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];
      if (Array.isArray(data)) {
        return data.filter((item): item is LegalCaseStudyPayload => this.isPayload(item));
      }
    }

    return [];
  }

  private isPayload(item: unknown): item is LegalCaseStudyPayload {
    return !!item && typeof item === 'object' && (
      'caseTitleAndCitation' in item ||
      'factsOfTheCase' in item ||
      'legalIssues' in item ||
      'references' in item ||
      'id' in item
    );
  }

  private syncEditorValue(field: EditableField): void {
    const editor = document.querySelector(`[data-editor="${field}"]`) as HTMLElement | null;
    if (editor) {
      this[field] = editor.innerHTML;
    }
  }

  private toPlainText(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getAuthHeaders(type: 'json' | 'form-data' = 'json'): HttpHeaders {
    const token = this.authService.getBearerToken();
    const headers: Record<string, string> = {};

    if (type === 'json') {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }
}
