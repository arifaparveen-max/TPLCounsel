import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActSectionsDtls } from './act-sections-dtls';
import { AuthService } from '../auth.service';

describe('ActSectionsDtls', () => {
  let component: ActSectionsDtls;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getBearerToken']);
    authServiceSpy.getBearerToken.and.returnValue('test-token');

    await TestBed.configureTestingModule({
      imports: [ActSectionsDtls, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ActSectionsDtls);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show validation when required fields are missing', () => {
    component.submitForm();
    expect(component.errorMessage).toContain('Please fill in all required fields');
  });
});
