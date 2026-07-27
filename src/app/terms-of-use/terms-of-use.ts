import { Component } from '@angular/core';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-terms-of-use',
  imports: [Footer],
  templateUrl: './terms-of-use.html',
  styles: `
    .terms-page {
      padding: 60px 0;
      background: #f8f9fa;
    }

    .terms-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      padding: 40px;
    }

    .terms-card h1,
    .terms-card h2,
    .terms-card h3 {
      color: #1f2d3d;
      margin-bottom: 12px;
    }

    .terms-card p,
    .terms-card li {
      color: #4b5563;
      line-height: 1.8;
      text-align: justify;
    }

    .terms-card ul {
      padding-left: 20px;
    }

    @media (max-width: 768px) {
      .terms-card {
        padding: 24px;
      }
    }
  `,
})
export class TermsOfUse {}
