import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from '../footer/footer';
import { FaqComponent } from '../faq/faq';
import { Ourservices } from '../ourservices/ourservices';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-main',
  imports: [Footer, FaqComponent, Ourservices],
  templateUrl: './main.html',
  styles: ``,
})
export class Main implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/pages']);
    }
  }
}
