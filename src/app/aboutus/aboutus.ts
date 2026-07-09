import { Component } from '@angular/core';
import { Footer } from "../footer/footer";

@Component({
  selector: 'app-aboutus',
  imports: [Footer],
  templateUrl: './aboutus.html',
  styles: `
   @media (max-width: 769px) {
      .section-header h2 {
            margin: 0;
            position: relative;
            font-size: 25px;
            font-weight: 700;
            white-space: nowrap;
            z-index: 1;
}
    }
  `,
})
export class Aboutus {}
