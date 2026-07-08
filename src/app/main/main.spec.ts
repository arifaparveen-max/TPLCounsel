import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Main } from './main';

describe('Main', () => {
  let component: Main;
  let fixture: ComponentFixture<Main>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Main],
    }).compileComponents();

    fixture = TestBed.createComponent(Main);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the main banner carousel', () => {
    const carousel = fixture.nativeElement.querySelector('#carousel');
    expect(carousel).not.toBeNull();
    expect(carousel.classList.contains('carousel')).toBeTrue();
    expect(carousel.classList.contains('carousel-fade')).toBeTrue();
  });

  it('has exactly three banner slides', () => {
    const items = fixture.nativeElement.querySelectorAll('#carousel .carousel-item');
    expect(items.length).toBe(3);
  });

  it('renders banner caption content for each slide', () => {
    const captions = fixture.nativeElement.querySelectorAll('#carousel .carousel-caption');
    expect(captions.length).toBe(3);
    captions.forEach((caption: HTMLElement) => {
      expect(caption.querySelector('h1')).not.toBeNull();
      expect(caption.querySelector('p')).not.toBeNull();
      expect(caption.querySelector('a.btn')).not.toBeNull();
    });
  });
});
