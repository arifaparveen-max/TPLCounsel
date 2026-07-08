import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a responsive material navigation shell', () => {
    const shell = fixture.nativeElement.querySelector('mat-sidenav-container');
    expect(shell).not.toBeNull();
  });

  it('shows the navigation links', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Home');
    expect(text).toContain('About');
    expect(text).toContain('Products');
    expect(text).toContain('Contact');
  });
});
