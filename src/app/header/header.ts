import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MatSidenavModule, MatToolbarModule, MatButtonModule, MatListModule, MatDividerModule, RouterLink, RouterLinkActive],
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
      align-items: center;
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

    .desktop-nav .dropdown {
      position: relative;
      display: inline-flex;
      flex-direction: column;
    }

    .desktop-nav .dropdown-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      color: #ffffff;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.2s ease, transform 0.2s ease;
    }

    .desktop-nav .dropdown-toggle:hover,
    .desktop-nav .dropdown.open > .dropdown-toggle {
      background: rgba(255,255,255,0.16);
    }

    .desktop-nav .dropdown.open > .dropdown-toggle .caret {
      transform: translateY(1px) rotate(180deg);
    }

    .desktop-nav .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      min-width: 180px;
      display: flex;
      flex-direction: column;
      background: #121518;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      padding: 8px 0;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.26);
      z-index: 1400;
      opacity: 0;
      visibility: hidden;
      transform: translateX(-16px);
      transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s ease;
      pointer-events: none;
    }

    .desktop-nav .dropdown:hover .dropdown-menu,
    .desktop-nav .dropdown:focus-within .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
      pointer-events: auto;
    }

    .desktop-nav .dropdown-menu {
      z-index: 1400;
    }

    .desktop-nav .dropdown-menu a {
      display: block;
      padding: 10px 18px;
      white-space: nowrap;
      color: #f8f7f2;
      background: transparent;
    }
    
    .desktop-nav .dropdown-toggle .caret {
      transform: translateY(1px);
      transition: transform 0.25s ease;
    }

    .desktop-nav .dropdown:hover .dropdown-toggle .caret,
    .desktop-nav .dropdown:focus-within .dropdown-toggle .caret {
      transform: translateY(1px) rotate(180deg);
    }

    .desktop-nav .dropdown-menu a:hover {
      background: rgba(170, 145, 102, 0.12);
      color: #aa9166;
    }

    .admin-badge {
      display: inline-flex;
      align-items: center;
      padding: 8px 14px;
      margin-left: 8px;
      border-radius: 999px;
      background: #aa9166;
      color: #121518;
      font-weight: 600;
      letter-spacing: 0.02em;
      border: 1px solid rgba(255, 255, 255, 0.16);
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

    .drawer-submenu {
      display: none;
      flex-direction: column;
      gap: 4px;
      padding-left: 20px;
      margin-bottom: 12px;
      transition: all 0.25s ease;
      overflow: hidden;
      max-height: 0;
      opacity: 0;
    }

    .drawer-submenu.open {
      display: flex;
      max-height: 200px;
      opacity: 1;
    }

    .drawer-submenu a,
    .drawer-toggle {
      padding-left: 12px;
      color: rgba(248, 247, 242, 0.85);
    }

    .drawer-toggle {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 12px 20px;
      border: none;
      background: none;
      color: #f8f7f2;
      text-align: left;
      font-size: 0.95rem;
      cursor: pointer;
      outline: none;
    }

    .drawer-toggle span {
      margin-left: auto;
      transition: transform 0.25s ease;
    }

    .drawer-toggle span.open {
      transform: rotate(180deg);
    }

    .drawer-submenu a.active,
    .drawer-toggle.active {
      color: #aa9166;
    }
    
    .desktop-nav .dropdown.active > a,
    .desktop-nav a.active {
      background: #aa9166;
      color: #121518;
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
  protected isAdminDrawerOpen = false;

  constructor(public auth: AuthService) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleAdminDrawer(): void {
    this.isAdminDrawerOpen = !this.isAdminDrawerOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.isAdminDrawerOpen = false;
  }
}
