import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { Footer } from '../footer/footer';

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
  imports: [Footer, CommonModule, RouterLink],
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

    .facebook-share-btn {
      width: 100%;
      border: none;
      border-radius: 999px;
      background: #1877f2;
      color: #fff;
      font-weight: 700;
      padding: 10px 14px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 8px 18px rgba(24, 119, 242, 0.2);
    }

    .facebook-share-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 22px rgba(24, 119, 242, 0.28);
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
  private pendingRouteId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private meta: Meta,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.pendingRouteId = params.get('id');
      this.syncSelectedCaseStudy(this.pendingRouteId ?? this.route.snapshot.queryParamMap.get('id'));
    });

    this.loadCaseStudies();
  }

  selectCaseStudy(item: LegalCaseStudyDetail): void {
    this.caseStudy = item;
    this.expandedSections = {};

    if (item.id != null) {
      this.router.navigate(['/case-study', item.id]);
    } else {
      this.router.navigate(['/case-study']);
    }
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

  shareOnFacebook(): void {
    const title = this.toPlainText(this.caseStudy?.caseName) || this.toPlainText(this.caseStudy?.caseTitleAndCitation) || 'Case Study';
    const description = this.toPlainText(this.caseStudy?.factsOfTheCase) || this.toPlainText(this.caseStudy?.conclusion) || 'Read this legal case study on TPL Counsel.';
    const shareUrl = this.buildFacebookShareUrl(title, description, this.caseStudy?.id);

    if (typeof window !== 'undefined' && window.open) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  }

  private loadCaseStudies(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<unknown>(`${environment.baseUrl}/LegalCaseStudies`).subscribe({
      next: (response) => {
        this.caseStudies = this.normalizeResponse(response);
        this.syncSelectedCaseStudy(this.pendingRouteId ?? this.route.snapshot.queryParamMap.get('id'));
      },
      error: () => {
        this.errorMessage = 'Unable to load case studies.';
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private syncSelectedCaseStudy(selectedId: string | null): void {
    if (!this.caseStudies.length) {
      this.caseStudy = null;
      this.resetMetaTags();
      return;
    }

    const matchedCase = this.caseStudies.find((item) => String(item.id) === String(selectedId)) ?? this.caseStudies[0] ?? null;
    this.caseStudy = matchedCase;
    this.expandedSections = {};

    if (matchedCase) {
      this.updateMetaTags(matchedCase);
    } else {
      this.resetMetaTags();
    }
  }

  private updateMetaTags(item: LegalCaseStudyDetail): void {
    const title = this.toPlainText(item.caseName) || this.toPlainText(item.caseTitleAndCitation) || 'Case Study';
    const description = this.toPlainText(item.factsOfTheCase) || this.toPlainText(item.conclusion) || 'Read the detailed case study and legal analysis.';
    const imageUrl = this.getImageUrl(item);
    const url = this.getCanonicalUrl(item.id);

    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:url', content: url });
  }

  private resetMetaTags(): void {
    this.titleService.setTitle('Case Study');
    this.meta.updateTag({ name: 'description', content: 'Case study details and legal analysis.' });
    this.meta.updateTag({ property: 'og:title', content: 'Case Study' });
    this.meta.updateTag({ property: 'og:description', content: 'Case study details and legal analysis.' });
    this.meta.updateTag({ property: 'og:image', content: `${environment.imgURL}/default-case-study.jpg` });
    this.meta.updateTag({ property: 'og:url', content: this.getBaseUrl('/case-study') });
  }

  private buildFacebookShareUrl(title: string, description: string, id?: number | null): string {
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const encodedUrl = encodeURIComponent(this.getCaseStudyUrl(id));
    return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}%20-%20${encodedDescription}`;
  }

  private getCaseStudyUrl(id?: number | null): string {
    const baseUrl = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://arifaparveen-max.github.io';
    return id != null ? `${baseUrl}/TPLCounsel/case-study/${id}` : `${baseUrl}/TPLCounsel/case-study`;
  }

  private getCanonicalUrl(id?: number | null): string {
    const path = id != null ? `/case-study/${id}` : '/case-study';
    return this.getBaseUrl(path);
  }

  private getBaseUrl(path: string): string {
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://arifaparveen-max.github.io';
    return `${origin}/TPLCounsel${path}`;
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
