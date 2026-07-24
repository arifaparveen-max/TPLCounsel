import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { environment } from '../../environments/environment';

interface LegalCaseStudyItem {
  id?: number;
  caseName?: string | null;
  caseTitleAndCitation?: string | null;
  factsOfTheCase?: string | null;
  conclusion?: string | null;
  imagePath?: string | null;
}

@Component({
  selector: 'app-casestudycarousel',
  imports: [CommonModule, CarouselModule, RouterLink],
  templateUrl: './casestudycarousel.html',
  styles: `
    .case-study-section {
      padding: 70px 0;
      background: linear-gradient(135deg, #f9f4ea 0%, #ffffff 100%);
    }

    .case-study-card {
      background: #fff;
      border-radius: 18px;
      border: 1px solid rgba(170, 145, 102, 0.2);
      overflow: hidden;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.06);
      min-height: 100%;
    }

    .case-study-image {
      width: 100%;
      height: 220px;
      object-fit: cover;
      display: block;
    }

    .case-study-body {
      padding: 22px;
    }

    .case-study-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .case-study-subtitle {
      font-size: 0.95rem;
      color: #6b7280;
      margin-bottom: 12px;
    }

    .case-study-text {
      color: #4b5563;
      font-size: 0.95rem;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .facts-preview {
      -webkit-line-clamp: 2;
    }

    .conclusion-preview {
      -webkit-line-clamp: 4;
      margin-top: 10px;
    }

    .details-btn {
      margin-top: 14px;
      display: inline-block;
      background: #aa9166;
      color: #fff;
      padding: 8px 14px;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 600;
    }

    .details-btn:hover {
      background: #8f744f;
      color: #fff;
    }
  `,
})
export class Casestudycarousel implements OnInit {
  caseStudies: LegalCaseStudyItem[] = [];
  isLoading = false;
  errorMessage = '';

  testimonialOptions = {
    loop: true,
    margin: 20,
    nav: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 6000,
    autoplayHoverPause: true,
    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      992: { items: 3 },
    },
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCaseStudies();
  }

  getImageUrl(item: LegalCaseStudyItem): string {
    const imagePath = item.imagePath?.trim();
    if (!imagePath) {
      return 'assets/img/carousel-1._oldjpg';
    }

    if (/^https?:\/\//i.test(imagePath)) {
      return imagePath;
    }

    return imagePath.startsWith('/') ? `${environment.imgURL}${imagePath}` : `${environment.imgURL}/${imagePath}`;
  }

  getCaseTitle(item: LegalCaseStudyItem): string {
    return this.toPlainText(item.caseName) || this.toPlainText(item.caseTitleAndCitation) || 'Case Study';
  }

  getFactsPreview(item: LegalCaseStudyItem): string {
    return this.toPlainText(item.factsOfTheCase) || 'No facts available yet.';
  }

  getConclusionPreview(item: LegalCaseStudyItem): string {
    return this.toPlainText(item.conclusion) || 'No conclusion available yet.';
  }

  private loadCaseStudies(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<unknown>(`${environment.baseUrl}/LegalCaseStudies`).subscribe({
      next: (response) => {
        this.caseStudies = this.normalizeResponse(response);
      },
      error: () => {
        this.errorMessage = 'Unable to load case studies right now.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private normalizeResponse(response: unknown): LegalCaseStudyItem[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is LegalCaseStudyItem => this.isCaseStudy(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];
      if (Array.isArray(data)) {
        return data.filter((item): item is LegalCaseStudyItem => this.isCaseStudy(item));
      }
    }

    return [];
  }

  private isCaseStudy(item: unknown): item is LegalCaseStudyItem {
    return !!item && typeof item === 'object' && ('caseName' in item || 'caseTitleAndCitation' in item || 'factsOfTheCase' in item || 'conclusion' in item);
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
}
