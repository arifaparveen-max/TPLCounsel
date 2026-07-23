import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LegalCaseStudies } from './legalcasestudies';
import { AuthService } from '../auth.service';

class AuthServiceStub {
  getBearerToken(): string | null {
    return null;
  }
}

describe('LegalCaseStudies', () => {
  let component: LegalCaseStudies;
  let fixture: ComponentFixture<LegalCaseStudies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, HttpClientTestingModule, LegalCaseStudies],
      providers: [{ provide: AuthService, useClass: AuthServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(LegalCaseStudies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
