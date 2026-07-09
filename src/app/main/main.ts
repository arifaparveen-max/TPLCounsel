import { Component } from '@angular/core';
import { Footer } from '../footer/footer';
import { FaqComponent } from '../faq/faq';

@Component({
  selector: 'app-main',
  imports: [Footer, FaqComponent],
  templateUrl: './main.html',
  styles: ``,
})
export class Main {}
