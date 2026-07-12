import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-act-master',
  imports: [CommonModule],
  templateUrl: './act-master.html',
  styles: `
    .admin-panel {
      padding: 60px 24px;
      max-width: 900px;
      margin: 0 auto;
      color: #121518;
    }

    .admin-panel .section-header h2 {
      margin-bottom: 16px;
      font-size: 2rem;
      color: #121518;
    }

    .admin-panel .section-header p {
      color: #5d5d5d;
      margin-bottom: 28px;
      line-height: 1.7;
    }

    .panel-card {
      background: #fff;
      border-radius: 18px;
      border: 1px solid rgba(170, 145, 102, 0.16);
      padding: 32px;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.06);
    }

    .panel-card h3 {
      margin-bottom: 18px;
      color: #2f2f2f;
    }

    .panel-card p {
      color: #555;
      line-height: 1.8;
    }
  `,
})
export class ActMaster {}
