import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { finalize, switchMap } from 'rxjs/operators';

interface ActSectionDtl {
  sectionId: string | number;
  actId: string | number;
  sectionNo: string | number;
  chapterName: string;
  bareAct: string;
  meaning: string;
  objective: string;
  illustration: string;
  exception: string;
  caseStudyId: string | number;
}

interface ActMasterOption {
  id?: number;
  actId?: number;
  actName?: string | null;
}

interface DisplayItem extends ActSectionDtl {
meaningSafe: SafeHtml;
  objectiveSafe: SafeHtml;
  illustrationSafe: SafeHtml;
  exceptionSafe: SafeHtml;
  actName?: string;
}

@Component({
  selector: 'app-act-section-dtls-listing',
  imports: [CommonModule, FormsModule],
  templateUrl: './act-section-dtls-listing.html',
  styles: `
    .section-listing {
      padding: 40px 24px;
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      min-height: 100vh;
    }

    .search-container {
      background: #aa9166;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 32px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .search-box {
      position: relative;
    }

    .search-box label {
      display: block;
      font-weight: 600;
      color: #121518;
      margin-bottom: 8px;
      text-transform: uppercase;
      font-size: 0.9rem;
    }

    .search-box input {
      width: 100%;
      padding: 10px 12px;
      border: none;
      border-radius: 4px;
      background: white;
      color: #333;
      font-size: 0.95rem;
    }

    .search-box input::placeholder {
      color: #999;
    }

    .section-table {
      width: 100%;
      background: white;
      border-collapse: collapse;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      table-layout: auto;
    }

    .table-wrapper {
      width: 100%;
      overflow-x: auto;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .table-wrapper::-webkit-scrollbar {
      height: 8px;
    }

    .table-wrapper::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .table-wrapper::-webkit-scrollbar-thumb {
      background: #aa9166;
      border-radius: 4px;
    }

    .table-wrapper::-webkit-scrollbar-thumb:hover {
      background: #8b7655;
    }

    .section-table thead {
      background: #aa9166;
      color: #121518;
    }

    .section-table thead th {
      padding: 16px 12px;
      text-align: left;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.9rem;
      border-right: 1px solid rgba(255, 255, 255, 0.2);
      white-space: nowrap;
    }

    .section-table thead th:not(.wide-column-header) {
      min-width: 100px;
    }

    .section-table thead th.wide-column-header {
      min-width: 600px;
    }

    .section-table thead th:last-child {
      border-right: none;
    }

    .section-table tbody tr {
      border-bottom: 1px solid #e8e8e8;
      transition: background-color 0.2s;
    }

    .section-table tbody tr:hover {
      background-color: #f9f9f9;
    }

    .section-table tbody td {
      padding: 16px 12px;
      color: #333;
      font-size: 0.95rem;
      vertical-align: top;
    }

    .section-table tbody td.wide-column {
      min-width: 300px;
      word-wrap: break-word;
      white-space: normal;
      overflow-wrap: break-word;
    }

    .section-table tbody td.merged-column {
      min-width: 600px;
      padding: 12px;
    }

    .field-group {
      margin: 12px 0;
      border: 1px solid #e8e8e8;
      border-radius: 6px;
      overflow: hidden;
      background: #fafafa;
    }

    .field-toggle {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: transparent;
      border: none;
      text-align: left;
      cursor: pointer;
      color: #121518;
      font: inherit;
    }

    .field-toggle:hover {
      background: #f1f1f1;
    }

    .field-label {
      font-weight: 700;
      color: #121518;
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .toggle-text {
      font-size: 0.8rem;
      color: #aa9166;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .field-value {
      color: #333;
      line-height: 1.5;
      padding: 0 12px 12px;
    }

    .merged-column hr {
      margin: 10px 0;
      border: none;
      border-top: 1px solid #ddd;
    }

    .section-table tbody td h1,
    .section-table tbody td h2,
    .section-table tbody td h3,
    .section-table tbody td h4,
    .section-table tbody td h5,
    .section-table tbody td h6 {
      margin: 12px 0 8px 0;
      color: #121518;
      font-weight: 600;
    }

    .section-table tbody td p {
      margin: 8px 0;
      line-height: 1.5;
    }

    .section-table tbody td ul,
    .section-table tbody td ol {
      margin: 8px 0 8px 20px;
      line-height: 1.6;
    }

    .section-table tbody td li {
      margin: 4px 0;
    }

    .section-table tbody td blockquote {
      margin: 8px 0;
      padding-left: 16px;
      border-left: 3px solid #aa9166;
      font-style: italic;
      color: #666;
    }

    .section-table tbody td hr {
      margin: 12px 0;
      border: none;
      border-top: 1px solid #ddd;
    }

    .section-table tbody td strong {
      font-weight: 700;
      color: #121518;
    }

    .section-table tbody td b {
      font-weight: 700;
      color: #121518;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #999;
      font-size: 1rem;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      border-left: 4px solid #c62828;
    }

    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    .page-size-select {
      min-width: 90px;
      border: 1px solid #aa9166;
      color: #121518;
      border-radius: 8px;
      padding: 6px 8px;
      background: #fff;
    }

    .pagination .page-link {
      color: #121518;
      border-color: #aa9166;
    }

    .pagination .page-item.active .page-link {
      background-color: #aa9166;
      border-color: #aa9166;
      color: #fff;
    }
  `,
})
export class ActSectionDtlsListing implements OnInit {
  actSectionDtlsList: DisplayItem[] = [];
  isLoading = false;
  errorMessage = '';
  expandedFieldState: Record<string, Record<string, boolean>> = {};

  searchSection = '';
  searchOffence = '';
  searchPunishment = '';
  searchCognizable = '';
  searchBailable = '';
  searchCourt = '';
  searchIllustration = '';
  searchActName = '';
  searchCaseStudyId = '';
  selectedActId: number | null = null;
  currentPage = 1;
  pageSize = 10;
  readonly pageSizeOptions = [10, 20, 30, 40, 50];

  private readonly apiUrl = 'https://employeesapi.runasp.net/api/ActSectionDtls';
  private readonly actMasterApiUrl = 'https://employeesapi.runasp.net/api/ActMasters';
  private actMasterOptions: ActMasterOption[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      const actId = id ? Number(id) : null;
      this.selectedActId = Number.isFinite(actId) && actId !== null ? actId : null;
      this.loadData();
    });
  }

  private loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<unknown>(this.actMasterApiUrl).pipe(
      switchMap((response) => {
        this.actMasterOptions = this.normalizeActMastersResponse(response);
        return this.http.get<unknown>(this.apiUrl);
      }),
      finalize(() => {
        this.isLoading = false;
      }),
    ).subscribe({
      next: (response) => {
        this.actSectionDtlsList = this.normalizeResponse(response);
      },
      error: () => {
        this.errorMessage = 'Unable to load section details. Please try again.';
        this.actSectionDtlsList = [];
      },
    });
  }

  private normalizeResponse(response: unknown): DisplayItem[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is ActSectionDtl => this.isValidItem(item)).map((item) => this.createDisplayItem(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];

      if (Array.isArray(data)) {
        return data.filter((item): item is ActSectionDtl => this.isValidItem(item)).map((item) => this.createDisplayItem(item));
      }
    }

    return [];
  }

  private createDisplayItem(item: ActSectionDtl): DisplayItem {
    return {
      ...item,
      meaningSafe: this.sanitizer.bypassSecurityTrustHtml(item.meaning),
      objectiveSafe: this.sanitizer.bypassSecurityTrustHtml(item.objective),
      illustrationSafe: this.sanitizer.bypassSecurityTrustHtml(item.illustration),
      exceptionSafe: this.sanitizer.bypassSecurityTrustHtml(item.exception),
      actName: this.getActMasterDisplayName(item.actId),
    };
  }

  private isValidItem(value: unknown): value is ActSectionDtl {
    return Boolean(
      value &&
      typeof value === 'object' &&
      ('chapterName' in value || 'bareAct' in value || 'sectionNo' in value),
    );
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

  private isActMasterOption(value: unknown): value is ActMasterOption {
    return Boolean(value && typeof value === 'object' && ('actName' in value || 'actId' in value || 'id' in value));
  }

  private getActMasterDisplayName(value: string | number | null | undefined): string {
    const actId = value;//this.resolveActMasterId(value);
    const match = this.actMasterOptions.find((item) => (item.actId ?? item.id) === actId);

    if (match?.actName?.trim()) {
      return match.actName.trim();
    }

    return typeof value === 'string' && value.trim() ? value : '';
  }

  private resolveActMasterId(value: string | number | null | undefined): number | null {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private getSectionKey(item: DisplayItem): string {
    return [item.sectionId, item.actId, item.sectionNo, item.caseStudyId].map((value) => String(value ?? '')).join('|');
  }

  isFieldExpanded(item: DisplayItem, field: 'meaning' | 'objective' | 'illustration' | 'exception'): boolean {
    const sectionKey = this.getSectionKey(item);
    const sectionState = this.expandedFieldState[sectionKey];

    if (!sectionState) {
      return field === 'meaning';
    }

    return sectionState[field] ?? field === 'meaning';
  }

  toggleField(item: DisplayItem, field: 'meaning' | 'objective' | 'illustration' | 'exception'): void {
    const sectionKey = this.getSectionKey(item);
    const sectionState = this.expandedFieldState[sectionKey] ?? {};
    sectionState[field] = !this.isFieldExpanded(item, field);
    this.expandedFieldState[sectionKey] = sectionState;
  }

  get filteredData(): DisplayItem[] {
    return this.actSectionDtlsList.filter((item) => {
      const actFilterMatch = this.selectedActId === null || this.getActId(item) === this.selectedActId;
      const sectionMatch = !this.searchSection || String(item.sectionNo).includes(this.searchSection);
      const offenceMatch = !this.searchOffence || item.bareAct.toLowerCase().includes(this.searchOffence.toLowerCase());
      const punishmentMatch = !this.searchPunishment || item.objective.toLowerCase().includes(this.searchPunishment.toLowerCase());
      const cognizableMatch = !this.searchCognizable || item.meaning.toLowerCase().includes(this.searchCognizable.toLowerCase());
      const baillableMatch = !this.searchBailable || item.exception.toLowerCase().includes(this.searchBailable.toLowerCase());
      const courtMatch = !this.searchCourt || item.chapterName.toLowerCase().includes(this.searchCourt.toLowerCase());
      const illustrationMatch = !this.searchIllustration || item.illustration.toLowerCase().includes(this.searchIllustration.toLowerCase());
      const actNameMatch = !this.searchActName || (item.actName ?? '').toLowerCase().includes(this.searchActName.toLowerCase()) || String(item.actId).includes(this.searchActName);
      const caseStudyMatch = !this.searchCaseStudyId || String(item.caseStudyId).includes(this.searchCaseStudyId);

      return actFilterMatch && sectionMatch && offenceMatch && punishmentMatch && cognizableMatch && baillableMatch && courtMatch && illustrationMatch && actNameMatch && caseStudyMatch;
    });
  }

  get paginatedData(): DisplayItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  onPageSizeChange(value: string | number): void {
    const parsedValue = Number(value);
    if (Number.isFinite(parsedValue) && parsedValue > 0) {
      this.pageSize = parsedValue;
      this.currentPage = 1;
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }

  goBack(): void {
    this.router.navigate(['/acts']);
  }

  private getActId(item: DisplayItem): number | null {
    if (typeof item.actId === 'number') {
      return item.actId;
    }

    if (typeof item.actId === 'string' && item.actId.trim()) {
      const parsed = Number(item.actId);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }
}
