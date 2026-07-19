import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LegalCategory } from './legal-category';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';

describe('LegalCategory', () => {
  let component: LegalCategory;
  let fixture: ComponentFixture<LegalCategory>;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getBearerToken']);
    authSpy.getBearerToken.and.returnValue('test-token');

    await TestBed.configureTestingModule({
      imports: [LegalCategory, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(LegalCategory);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads categories with a bearer token attached', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(environment.baseUrl + '/LegalCategoryMasters');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush([{ categoryName: 'Family Law', alias: 'family', description: 'Desc', categoryIconPath: '', iconClass: '' }]);

    expect(component.categories.length).toBe(1);
    expect(component.categories[0].categoryName).toBe('Family Law');
    expect(authService.getBearerToken).toHaveBeenCalled();
  });

  it('normalizes wrapped API responses so rows render', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(environment.baseUrl+'/LegalCategoryMasters');
    req.flush({
      data: [{ categoryName: 'Corporate Law', alias: 'corporate', description: 'Corporate matters', categoryIconPath: '/img/corporate.png', iconClass: 'fa-briefcase' }],
      count: 1,
    });

    expect(component.categories.length).toBe(1);
    expect(component.categories[0].categoryName).toBe('Corporate Law');
    expect(component.categories[0].alias).toBe('corporate');
  });
});
