import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-header',
  imports: [MatSidenavModule, MatToolbarModule, MatButtonModule, MatListModule, MatDividerModule, RouterLink],
  templateUrl: './header.html',
  styles: `
    .nav-shell {
      min-height: 50px;
      background: #f8f7f2;
      position: static;
      z-index: 1200;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: #121518;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      position: sticky;
      top: 0;
      z-index: 1201;
    }

    .brand {
      color: #aa9166;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-decoration: none;
      line-height: 1.1;
    }

    .brand small {
      display: block;
      color: #f1e4c8;
      font-size: 0.75rem;
      letter-spacing: 0;
      text-transform: none;
      margin-top: 2px;
    }

    .desktop-nav {
      display: flex;
      gap: 8px;
    }

    .desktop-nav a {
      padding: 10px 14px;
      border-radius: 999px;
      color: #ffffff;
      text-decoration: none;
      font-weight: 500;
    }

    .desktop-nav a:hover,
    .desktop-nav a.active {
      background: #aa9166;
      color: #121518;
    }

    .menu-toggle {
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #ffffff;
      background: transparent;
    }

    .drawer {
      width: 260px;
      background: #121518;
      color: #ffffff;
      padding: 16px 0;
      z-index: 1300;
      height: auto;
      max-height: none;
      overflow: visible;
    }

    ::ng-deep .mat-drawer-backdrop {
      z-index: 1250 !important;
    }

    ::ng-deep .mat-drawer-content {
      overflow: visible;
    }

    .drawer-title {
      color: #aa9166;
      font-size: 0.82rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      padding: 0 20px 12px;
      text-transform: uppercase;
    }

    .drawer a {
      display: block;
      color: #f8f7f2;
      text-decoration: none;
      padding: 12px 20px;
      border-left: 3px solid transparent;
    }

    .drawer a:hover,
    .drawer a.active {
      background: rgba(170, 145, 102, 0.16);
      color: #aa9166;
      border-left-color: #aa9166;
    }

    .content {
      padding: 24px;
      color: #454545;
    }

    @media (max-width: 768px) {
      .desktop-nav {
        display: none;
      }

      .content {
        padding: 16px;
      }

      .nav-shell {
        position: static;
        z-index: 2000;
      }

      .topbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 2002;
      }

      .drawer {
        position: fixed !important;
        top: 0;
        left: 0;
        bottom: 0;
        width: min(85vw, 280px);
        height: 100vh;
        max-height: 100vh;
        overflow: hidden;
        z-index: 2003;
      }

      ::ng-deep .mat-drawer-backdrop {
        z-index: 2001 !important;
      }

      ::ng-deep .mat-drawer-container {
        overflow: visible;
      }
    }

    @media (min-width: 769px) {
      .menu-toggle {
        display: none;
      }
    }
  `,
})
export class Header {
  protected isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
