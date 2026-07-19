import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActListing } from './act-listing';
import { environment } from '../../environments/environment';

describe('ActListing', () => {
  let fixture: ComponentFixture<ActListing>;
  let component: ActListing;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActListing, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ActListing);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads acts from the API and paginates them into 9 per page', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(environment.baseUrl + '/ActMasters');
    expect(req.request.method).toBe('GET');

    const sampleActs = Array.from({ length: 10 }, (_, index) => ({
      actId: index + 1,
      actName: `Act ${index + 1}`,
      alias: `A${index + 1}`,
      actDetails: `Details ${index + 1}`,
      imagePath: `/uploads/act-${index + 1}.png`,
      legalCategoryId: 1,
      dateOfEffect: '2026-07-17T00:00:00',
    }));

    req.flush(sampleActs);

    expect(component.acts.length).toBe(10);
    expect(component.paginatedActs.length).toBe(9);
    expect(component.totalPages).toBe(2);
    expect(component.paginatedActs[0].actName).toBe('Act 1');
    expect(component.paginatedActs[8].actName).toBe('Act 9');
  });
});
