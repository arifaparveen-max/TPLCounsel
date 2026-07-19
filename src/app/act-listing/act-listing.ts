import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Footer } from "../footer/footer";

interface ActListingItem {
  actId?: number;
  id?: number;
  actName?: string;
  alias?: string;
  actDetails?: string;
  imagePath?: string | null;
  legalCategoryId?: number | null;
  dateOfEffect?: string | null;
}

@Component({
  selector: 'app-act-listing',
  imports: [CommonModule, Footer],
  templateUrl: './act-listing.html',
  styles: `
    .page-shell {
      padding: 40px 0 80px;
      background: #f8f9fa;
    }

    .blog-item {
      margin-bottom: 30px;
    }

    .blog-item img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-radius: 8px;
    }

    .blog-item .meta {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin: 12px 0;
      color: #6c757d;
      font-size: 14px;
    }

    .blog-item .meta a,
    .blog-item .meta p {
      margin: 0;
    }

    .btn {
      border-radius: 999px;
      padding: 10px 20px;
    }

    .pagination .page-item .page-link {
      color: #aa9166;
    }

    .pagination .page-item.active .page-link {
      background-color: #aa9166;
      border-color: #aa9166;
      color: #fff;
    }
  `,
})
export class ActListing implements OnInit {
  acts: ActListingItem[] = [];
  currentPage = 1;
  pageSize = 9;
  isLoading = false;
  errorMessage = '';
  readonly baseImgUrl = environment.baseImgUrl || environment.imgURL;

  private readonly apiUrl = environment.baseUrl + '/ActMasters';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadActs();
  }

  get paginatedActs(): ActListingItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.acts.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.acts.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
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

  getActImage(item: ActListingItem): string {
    const imagePath = this.baseImgUrl + item.imagePath?.trim();
    console.log("imagePath:" + imagePath)
    if (!imagePath) {
      return 'assets/img/blog-1.jpg';
    }

    return imagePath.startsWith('https') ? imagePath : `${imagePath}`;
  }

  getFormattedDate(value?: string | null): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private loadActs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<unknown>(this.apiUrl).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        this.acts = this.normalizeActsResponse(response);
        this.currentPage = 1;
      },
      error: () => {
        this.errorMessage = 'Unable to load acts at the moment.';
      },
    });
  }

  private normalizeActsResponse(response: unknown): ActListingItem[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is ActListingItem => this.isActItem(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];
      if (Array.isArray(data)) {
        return data.filter((item): item is ActListingItem => this.isActItem(item));
      }
    }

    return [];
  }

  private isActItem(value: unknown): value is ActListingItem {
    return Boolean(value && typeof value === 'object' && ('actName' in value || 'alias' in value));
  }
}
