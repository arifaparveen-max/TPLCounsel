import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth.service';

interface LegalCategoryService {
  id: number;
  categoryName: string;
  alias: string;
  description: string;
  categoryIconPath: string | null;
  iconClass: string;
  createdOn: string;
  updatedOn: string | null;
}

@Component({
  selector: 'app-ourservices',
  imports: [CommonModule],
  templateUrl: './ourservices.html',
  styles: ``,
})
export class Ourservices implements OnInit {
  services: LegalCategoryService[] = [];
  isLoading = false;
  errorMessage = '';
  private readonly apiUrl = 'https://employeesapi.runasp.net/api/LegalCategoryMasters';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadServices();
    }
  }

  private loadServices(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<unknown>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        this.services = this.normalizeResponse(response);
      },
      error: (error: any) => {
        this.errorMessage = 'Unable to load services. Please try again later.';
        console.error('Load services error:', error);
      },
    });
  }

  private normalizeResponse(response: unknown): LegalCategoryService[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is LegalCategoryService => this.isServiceItem(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];
      if (Array.isArray(data)) {
        return data.filter((item): item is LegalCategoryService => this.isServiceItem(item));
      }
    }

    return [];
  }

  private isServiceItem(value: unknown): value is LegalCategoryService {
    return Boolean(
      value &&
      typeof value === 'object' &&
      'id' in value &&
      'categoryName' in value &&
      'description' in value &&
      'iconClass' in value
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getBearerToken();
    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
