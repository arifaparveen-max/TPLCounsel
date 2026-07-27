import { TestBed } from '@angular/core/testing';
import { TermsOfUse } from './terms-of-use';

describe('TermsOfUse', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsOfUse],
    }).compileComponents();
  });

  it('should render the terms of use heading', () => {
    const fixture = TestBed.createComponent(TermsOfUse);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Terms of Use');
  });
});
