import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-pages',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './pages.html',
  styles: `
    .admin-pages {
      padding: 60px 24px;
      max-width: 1100px;
      margin: 0 auto;
    }

    .admin-pages .section-header h2 {
      margin-bottom: 12px;
    }

    .admin-dashboard {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 260px;
      gap: 24px;
      align-items: start;
      margin-top: 30px;
    }

    .sub-menu-card {
      background: #fff;
      border: 1px solid rgba(170, 145, 102, 0.18);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    }

    .sub-menu-card h3 {
      margin: 0 0 14px;
      font-size: 1.1rem;
    }

    .submenu-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
    }

    .submenu-list a {
      display: block;
      padding: 12px 14px;
      border-radius: 12px;
      text-decoration: none;
      color: #121518;
      background: #f8f7f2;
      border: 1px solid rgba(170, 145, 102, 0.18);
      transition: all 0.2s ease;
    }

    .submenu-list a:hover,
    .submenu-list a.active {
      background: #aa9166;
      color: #fff;
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .admin-dashboard {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class Pages {
  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
