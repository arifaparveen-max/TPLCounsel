import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaqComponent } from './faq';

describe('FaqComponent', () => {
  let fixture: ComponentFixture<FaqComponent>;
  let component: FaqComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open only one FAQ item at a time', () => {
    component.toggleFaq(1);
    expect(component.faqItems[1].isOpen).toBeTrue();
    expect(component.faqItems[0].isOpen).toBeFalse();

    component.toggleFaq(2);
    expect(component.faqItems[1].isOpen).toBeFalse();
    expect(component.faqItems[2].isOpen).toBeTrue();
  });
});
