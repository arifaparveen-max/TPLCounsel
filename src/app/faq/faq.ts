import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrls: ['./faq.css'],
})
export class FaqComponent {
  faqItems: FaqItem[] = [
    {
      id: 1,
      question: 'How can I schedule a consultation with your firm?',
      answer:
        'You can request a consultation by filling out the contact form, calling our office, or sending us an email. Our team will respond promptly with available time slots.',
      isOpen: true,
    },
    {
      id: 2,
      question: 'Do you provide legal advice for businesses and startups?',
      answer:
        'Yes. We advise businesses on contracts, compliance, governance, dispute resolution, and other legal matters that affect day-to-day operations.',
      isOpen: false,
    },
    {
      id: 3,
      question: 'Are your consultations confidential?',
      answer:
        'Absolutely. All consultations are handled with strict confidentiality, and we protect your personal and legal information with care.',
      isOpen: false,
    },
    {
      id: 4,
      question: 'Can you represent clients outside the local area?',
      answer:
        'Yes. We can assist clients remotely and coordinate legal support across jurisdictions when appropriate to your matter.',
      isOpen: false,
    },
  ];

  toggleFaq(itemId: number): void {
    this.faqItems = this.faqItems.map((item) => ({
      ...item,
      isOpen: item.id === itemId ? !item.isOpen : false,
    }));
  }
}
