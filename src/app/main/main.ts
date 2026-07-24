import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from '../footer/footer';
import { FaqComponent } from '../faq/faq';
import { Ourservices } from '../ourservices/ourservices';
import { AuthService } from '../auth.service';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  imports: [Footer, FaqComponent, Ourservices, CarouselModule,CommonModule],
  templateUrl: './main.html',
  styles: ``,

})
export class Main implements OnInit {
  
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
      testimonials = [
  {
    name: "John Smith",
    profession: "Business Owner",
    review: "TPL Counsel helped me win a complex banking dispute. Their expertise and dedication are unmatched. Highly recommended!",
    image: "assets/img/testimonial-1.jpg"
  },
  {
    name: "Priya Sharma",
    profession: "IT Professional",
    review: "Excellent service in cyber law matters. They explained everything clearly and got me the best possible outcome.",
    image: "assets/img/testimonial-2.jpg"
  },
    {
      name: "Rahul Verma",
      profession: "Family Law Client",
      review: "Professional, compassionate and very effective...",
      image: "assets/img/testimonial-3.jpg"
    },
    {
      name: "Ayesha Khan",
      profession: "Immigration Client",
      review: "Thanks to TPL Counsel, my visa application...",
      image: "assets/img/testimonial-4.jpg"
    }
  // Add more as needed
];
  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/pages']);
      
      
    }
  }
}

