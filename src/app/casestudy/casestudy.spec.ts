import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Casestudy } from './casestudy';
import { environment } from '../../environments/environment';

describe('Casestudy', () => {
  let fixture: ComponentFixture<Casestudy>;
  let component: Casestudy;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Casestudy, HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({}),
            },
            paramMap: of(convertToParamMap({ id: '2' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Casestudy);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('selects the case study based on the route id', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(environment.baseUrl + '/LegalCaseStudies');
    expect(req.request.method).toBe('GET');

    req.flush([
      { id: 1, caseName: 'First Case', factsOfTheCase: 'First facts' },
      { id: 2, caseName: 'Second Case', factsOfTheCase: 'Second facts' },
    ]);

    expect(component.caseStudy?.id).toBe(2);
    expect(component.caseStudy?.caseName).toBe('Second Case');
  });
});
