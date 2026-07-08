import { Component, signal } from '@angular/core';
import { Header } from './header/header';
import { MatToolbar } from "@angular/material/toolbar";
import { Main } from "./main/main";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-root',
  imports: [Header,  RouterOutlet],
  templateUrl: './app.html',
  styles:  `
    .top-bar {
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
      height: 120px;
    }

    .logo h1 {
      color: #aa9166;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-decoration: none;
      line-height: 1.1;
    }
  .top-bar .text {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      height: 90px;
      color: #ffffff!;
      padding: 0 20px;
      text-align: center;
      border-left: 1px solid rgba(255, 255, 255, .15);
    }
    .top-bar .text h2 {
      color: #ffffff;
      font-family: 'Roboto', sans-serif;
      font-weight: 500;
      font-style: normal;
      font-size: 25px;
      margin: 0;
    }
    .top-bar .top-bar-right {
      display: flex;
      align-items: center;
    }

    @media (max-width: 575.98px) {
     .top-bar .text h2 {
      color: #ffffff;
      font-family: 'Roboto', sans-serif;
      font-weight: 500;
      font-style: normal;
      font-size: 15px;
      margin: 0;
    }
    }

    .top-bar-right .text h2 {
      margin: 0;
    } `,
})
export class App {
  protected readonly title = signal('my-angular-app');
}
