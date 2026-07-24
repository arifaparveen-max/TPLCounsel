import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from '../footer/footer';
import { FaqComponent } from '../faq/faq';
import { Ourservices } from '../ourservices/ourservices';
import { AuthService } from '../auth.service';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Casestudycarousel } from '../casestudycarousel/casestudycarousel';
import { environment } from '../../environments/environment';

interface TestimonialItem {
  name: string;
  profession: string;
  review: string;
  image: string;
}

interface LegalCaseStudyApiItem {
  caseName?: string | null;
  factsOfTheCase?: string | null;
  conclusion?: string | null;
  imagePath?: string | null;
}

@Component({
  selector: 'app-main',
  imports: [Footer, FaqComponent, Ourservices, CarouselModule, CommonModule, Casestudycarousel],
  templateUrl: './main.html',
  styles: ``,

})
export class Main implements OnInit {
  testimonials: TestimonialItem[] = [];
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
        navText: [
          '<i class="fa fa-chevron-left"></i>',
          '<i class="fa fa-chevron-right"></i>'
        ],
        responsive: {
          0: { items: 1 },
          768: { items: 2 },
          992: { items: 3 }
        }
      };
  constructor(private auth: AuthService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.loadTestimonials();

    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/pages']);
    }
  }

  private loadTestimonials(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<unknown>(`${environment.baseUrl}/LegalCaseStudies`).subscribe({
      next: (response) => {
        this.testimonials = this.normalizeTestimonials(response);
      },
      error: () => {
        this.errorMessage = 'Unable to load testimonials right now.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private normalizeTestimonials(response: unknown): TestimonialItem[] {
    const items = Array.isArray(response)
      ? response
      : response && typeof response === 'object'
        ? (response as { data?: unknown }).data
        : [];

    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .filter((item): item is LegalCaseStudyApiItem => !!item && typeof item === 'object')
      .slice(0, 6)
      .map((item) => ({
        name: this.toPlainText(item.caseName) || 'Case Study',
        profession: this.truncate(this.toPlainText(item.factsOfTheCase), 50),
        review: this.truncate(this.toPlainText(item.conclusion), 150),
        image: this.getImageUrl(item.imagePath),
      }));
  }

  private getImageUrl(imagePath: string | null | undefined): string {
    const value = imagePath?.trim();
    if (!value) {
      return 'assets/img/testimonial-1.jpg';
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    return value.startsWith('/') ? `${environment.imgURL}${value}` : `${environment.imgURL}/${value}`;
  }

  private truncate(value: string, maxLength: number): string {
    const text = this.toPlainText(value);
    if (text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength - 3).trimEnd()}...`;
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

