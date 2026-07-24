import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';

interface LegalCaseStudyDetail {
  id?: number;
  caseName?: string | null;
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
  imagePath?: string | null;
}

@Component({
  selector: 'app-casestudy',
  imports: [CommonModule],
  templateUrl: './casestudy.html',
  styles: `
    .case-detail-page {
      padding: 70px 0;
      background: #f9f4ea;
    }

    .case-shell {
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }

    .case-menu {
      width: 30%;
      background: #fff;
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.07);
      position: sticky;
      top: 20px;
    }

    .case-details {
      width: 70%;
      background: #fff;
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.07);
    }

    .case-image {
      width: 100%;
      max-height: 280px;
      object-fit: cover;
      border-radius: 16px;
      margin-bottom: 20px;
    }

    .case-menu-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 12px;
    }

    .case-menu-btn {
      width: 100%;
      text-align: left;
      background: #f7f1e6;
      border: 1px solid #e7dcc5;
      border-radius: 10px;
      padding: 10px 12px;
      color: #4b5563;
      font-weight: 600;
      cursor: pointer;
    }

    .case-menu-btn.active {
      background: #aa9166;
      color: #fff;
      border-color: #aa9166;
    }

    .detail-section {
      margin-bottom: 16px;
      border: 1px solid #eee3ce;
      border-radius: 12px;
      overflow: hidden;
      background: #fcfaf7;
    }

    .detail-header {
      width: 100%;
      background: transparent;
      border: none;
      padding: 14px 16px;
      text-align: left;
      font-weight: 700;
      color: #aa9166;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }

    .detail-body {
      padding: 0 16px 16px;
      color: #4b5563;
      line-height: 1.7;
    }

    @media (max-width: 992px) {
      .case-shell {
        flex-direction: column;
      }

      .case-menu,
      .case-details {
        width: 100%;
      }
    }
  `,
})
export class Casestudy implements OnInit {
  caseStudies: LegalCaseStudyDetail[] = [];
  caseStudy: LegalCaseStudyDetail | null = null;
  isLoading = false;
  errorMessage = '';
  expandedSections: Record<string, boolean> = {};

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCaseStudies();
  }

  selectCaseStudy(item: LegalCaseStudyDetail): void {
    this.caseStudy = item;
    this.expandedSections = {};
  }

  getImageUrl(item?: LegalCaseStudyDetail | null): string {
    const imagePathValue = (item ?? this.caseStudy)?.imagePath?.trim();
    if (!imagePathValue) {
      return 'assets/img/carousel-1._oldjpg';
    }

    if (/^https?:\/\//i.test(imagePathValue)) {
      return imagePathValue;
    }

    return imagePathValue.startsWith('/') ? `${environment.imgURL}${imagePathValue}` : `${environment.imgURL}/${imagePathValue}`;
  }

  toggleSection(key: string): void {
    this.expandedSections[key] = !this.expandedSections[key];
  }

  private loadCaseStudies(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<unknown>(`${environment.baseUrl}/LegalCaseStudies`).subscribe({
      next: (response) => {
        this.caseStudies = this.normalizeResponse(response);
        const selectedId = this.route.snapshot.queryParamMap.get('id');
        const initialCase = this.caseStudies.find((item) => String(item.id) === selectedId) ?? this.caseStudies[0] ?? null;
        this.caseStudy = initialCase;
      },
      error: () => {
        this.errorMessage = 'Unable to load case studies.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private normalizeResponse(response: unknown): LegalCaseStudyDetail[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is LegalCaseStudyDetail => this.isCaseStudy(item));
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const data = candidate['data'];
      if (Array.isArray(data)) {
        return data.filter((item): item is LegalCaseStudyDetail => this.isCaseStudy(item));
      }
    }

    return [];
  }

  private isCaseStudy(item: unknown): item is LegalCaseStudyDetail {
    return !!item && typeof item === 'object' && ('caseName' in item || 'caseTitleAndCitation' in item || 'factsOfTheCase' in item || 'conclusion' in item);
  }
}
