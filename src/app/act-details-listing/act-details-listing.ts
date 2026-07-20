import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Footer } from '../footer/footer';

interface ActDetailItem {
  id?: number;
  section?: string;
  offence?: string;
  punishment?: string;
  cognizableOrNon_Cognizable?: string;
  bailableOrNon_Bailable?: string;
  trialCourt?: string;
  actName?: number | string | null;
}

interface ActListingItem {
  id?: number;
  actId?: number;
  actName?: string;
  alias?: string;
}

@Component({
  selector: 'app-act-details-listing',
  imports: [CommonModule, FormsModule, Footer],
  templateUrl: './act-details-listing.html',
  styles: `
    .page-shell {
      padding: 40px 0 80px;
      background: #f8f9fa;
      min-height: 70vh;
    }

    .page-title {
      margin-bottom: 24px;
      color: #121518;
      font-weight: 700;
    }

    .page-caption {
      color: #4d4d4d;
      margin-bottom: 24px;
    }

    .table-card {
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      background: #fff;
    }

    .table-head {
      background: #121518;
      color: #fff;
    }

    .table-head th {
      padding: 14px 12px;
      font-weight: 600;
      border: none;
      text-transform: uppercase;
      font-size: 13px;
      letter-spacing: 0.03em;
      white-space: nowrap;
    }

    .table-row {
      background: #aa9166;
      color: #121518;
    }

    .table-row td {
      padding: 14px 12px;
      border: 1px solid rgba(18, 21, 24, 0.08);
      vertical-align: top;
    }

    .table-row:nth-child(even) {
      background: #c6af86;
    }

    .column-section,
    .column-cognizable,
    .column-bailable,
    .column-court {
      width: 12%;
      min-width: 120px;      
    }

    .column-offence,
    .column-punishment {
      width: 24%;
      min-width: 260px;
    }

    .pagination-bar {
      padding: 16px 0 0;
      gap: 16px;
      flex-wrap: wrap;
      width: 100%;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .pagination-nav {
      width: 100%;
      overflow-x: auto;
    }

    .pagination-nav .pagination {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 4px;
      white-space: nowrap;
    }

    .page-size-select {
      min-width: 90px;
      width: auto;
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

    .search-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d8d8d8;
      border-radius: 8px;
      background: #fff;
      color: #121518;
    }

    .search-input:focus {
      outline: none;
      border-color: #aa9166;
      box-shadow: 0 0 0 2px rgba(170, 145, 102, 0.16);
    }

    .empty-state {
      padding: 20px;
      background: #fff3cd;
      border-radius: 10px;
      color: #6c4a00;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #aa9166;
      font-weight: 600;
      margin-bottom: 20px;
      text-decoration: none;
    }

    .back-link:hover {
      color: #8b6d3f;
      text-decoration: underline;
    }
  `,
})
export class ActDetailsListing implements OnInit {
  allDetails: ActDetailItem[] = [];
  currentActName = 'Act Details';
  isLoading = false;
  errorMessage = '';
  searchFilters = {
    section: '',
    offence: '',
    punishment: '',
    cognizableOrNon_Cognizable: '',
    bailableOrNon_Bailable: '',
    trialCourt: '',
  };
  selectedActId: number | null = null;
  currentPage = 1;
  pageSize = 10;
  readonly pageSizeOptions = [10, 20, 30, 40, 50];
  actMasters: { id?: number; actName?: string }[] = [];
  actMastersDict :{actId?: number; actName?: string}[] = [];

  private readonly apiUrl = environment.baseUrl + '/ActDetails';
  private readonly actMastersApiUrl = environment.baseUrl + '/ActMasters';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      const actId = id ? Number(id) : null;
      this.selectedActId = Number.isFinite(actId) && actId !== null ? actId : null;
      this.loadActMasters();
      this.loadDetails();
    });
  }

  get filteredDetails(): ActDetailItem[] {
    const search = this.searchFilters;

    return this.allDetails.filter((detail) => {
      const matchesAct = this.selectedActId === null || this.getActId(detail) === this.selectedActId || this.getActName(detail) === this.currentActName;
      return (
        matchesAct &&
        this.matchesField(detail.section, search.section) &&
        this.matchesField(detail.offence, search.offence) &&
        this.matchesField(detail.punishment, search.punishment) &&
        this.matchesField(detail.cognizableOrNon_Cognizable, search.cognizableOrNon_Cognizable) &&
        this.matchesField(detail.bailableOrNon_Bailable, search.bailableOrNon_Bailable) &&
        this.matchesField(detail.trialCourt, search.trialCourt)
      );
    });
  }

  get paginatedDetails(): ActDetailItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDetails.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredDetails.length / this.pageSize));
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

  private loadDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<unknown>(this.apiUrl).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (response) => {
        this.allDetails = this.normalizeDetails(response);
        this.currentActName = this.resolveActName();
      },
      error: () => {
        this.errorMessage = 'Unable to load act details at the moment.';
      },
    });
  }

  private loadActMasters(): void {
    this.http.get<unknown>(this.actMastersApiUrl).subscribe({
      next: (response) => {
        this.actMasters = this.normalizeActMastersResponse(response);
        this.actMastersDict = this.normalizeActMastersResponse(response); 
        this.currentActName = this.resolveActName();
      },
      error: () => {
        // Keep currentActName fallback if act master lookup fails.
      },
    });
  }

  private resolveActName(): string {
    if (!this.selectedActId) {
      return 'Act Details';
    }

    const match = this.actMastersDict.find((item) => item.actId === this.selectedActId);
    const actName = match?.actName?.trim();

    return actName ? `Act Details for ${actName}` : `Act Details for ${this.selectedActId}`;
  }

  private normalizeDetails(response: unknown): ActDetailItem[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is ActDetailItem => this.isDetailItem(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];
      if (Array.isArray(data)) {
        return data.filter((item): item is ActDetailItem => this.isDetailItem(item));
      }
    }

    return [];
  }

  private normalizeActMastersResponse(response: unknown): { actId?: number; actName?: string }[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is { actId?: number; actName?: string } => this.isActMasterItem(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];
      if (Array.isArray(data)) {
        return data.filter((item): item is { actId?: number; actName?: string } => this.isActMasterItem(item));
      }
    }

    return [];
  }

  private isActMasterItem(value: unknown): value is { actId?: number; actName?: string } {
    return Boolean(value && typeof value === 'object' && ('actName' in value));
  }

  private isDetailItem(value: unknown): value is ActDetailItem {
    return Boolean(value && typeof value === 'object' && ('section' in value || 'offence' in value || 'punishment' in value));
  }

  private matchesField(value: string | undefined, searchText: string): boolean {
    if (!searchText.trim()) {
      return true;
    }

    return (value ?? '').toLowerCase().includes(searchText.trim().toLowerCase());
  }

  private getActId(detail: ActDetailItem): number | null {
    if (typeof detail.actName === 'number') {
      return detail.actName;
    }

    if (typeof detail.actName === 'string' && detail.actName.trim()) {
      const parsed = Number(detail.actName);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private getActName(detail: ActDetailItem): string {
    if (typeof detail.actName === 'string' && detail.actName.trim()) {
      return detail.actName.trim();
    }

    return '';
  }
}
