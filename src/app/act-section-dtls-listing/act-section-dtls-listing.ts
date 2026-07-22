import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../auth.service';
import { finalize } from 'rxjs/operators';

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

interface DisplayItem extends ActSectionDtl {
  objectiveSafe: SafeHtml;
  illustrationSafe: SafeHtml;
  exceptionSafe: SafeHtml;
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
    }

    .field-label {
      font-weight: 700;
      color: #121518;
      margin-bottom: 6px;
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .field-value {
      color: #333;
      line-height: 1.5;
      margin-bottom: 8px;
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
  `,
})
export class ActSectionDtlsListing implements OnInit {
  actSectionDtlsList: DisplayItem[] = [];
  isLoading = false;
  errorMessage = '';

  searchSection = '';
  searchOffence = '';
  searchPunishment = '';
  searchCognizable = '';
  searchBailable = '';
  searchCourt = '';
  searchIllustration = '';
  searchActId = '';
  searchCaseStudyId = '';

  private readonly apiUrl = 'https://employeesapi.runasp.net/api/ActSectionDtls';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.loadActSectionDtls();
  }

  private loadActSectionDtls(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<unknown>(this.apiUrl).pipe(
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
      objectiveSafe: this.sanitizer.bypassSecurityTrustHtml(item.objective),
      illustrationSafe: this.sanitizer.bypassSecurityTrustHtml(item.illustration),
      exceptionSafe: this.sanitizer.bypassSecurityTrustHtml(item.exception),
    };
  }

  private isValidItem(value: unknown): value is ActSectionDtl {
    return Boolean(
      value &&
      typeof value === 'object' &&
      ('chapterName' in value || 'bareAct' in value || 'sectionNo' in value),
    );
  }

  get filteredData(): DisplayItem[] {
    return this.actSectionDtlsList.filter((item) => {
      const sectionMatch = !this.searchSection || String(item.sectionNo).includes(this.searchSection);
      const offenceMatch = !this.searchOffence || item.bareAct.toLowerCase().includes(this.searchOffence.toLowerCase());
      const punishmentMatch = !this.searchPunishment || item.objective.toLowerCase().includes(this.searchPunishment.toLowerCase());
      const cognizableMatch = !this.searchCognizable || item.meaning.toLowerCase().includes(this.searchCognizable.toLowerCase());
      const baillableMatch = !this.searchBailable || item.exception.toLowerCase().includes(this.searchBailable.toLowerCase());
      const courtMatch = !this.searchCourt || item.chapterName.toLowerCase().includes(this.searchCourt.toLowerCase());
      const illustrationMatch = !this.searchIllustration || item.illustration.toLowerCase().includes(this.searchIllustration.toLowerCase());
      const actIdMatch = !this.searchActId || String(item.actId).includes(this.searchActId);
      const caseStudyMatch = !this.searchCaseStudyId || String(item.caseStudyId).includes(this.searchCaseStudyId);

      return sectionMatch && offenceMatch && punishmentMatch && cognizableMatch && baillableMatch && courtMatch && illustrationMatch && actIdMatch && caseStudyMatch;
    });
  }
}
