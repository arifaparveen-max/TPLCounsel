import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ActDetailsListing } from './act-details-listing';

describe('ActDetailsListing', () => {
  let fixture: ComponentFixture<ActDetailsListing>;
  let component: ActDetailsListing;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActDetailsListing, HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '7' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActDetailsListing);
    component = fixture.componentInstance;
  });

  it('filters the visible details based on the configured column search text', () => {
    component.allDetails = [
      {
        section: '10',
        offence: 'Theft',
        punishment: '1 year',
        cognizableOrNon_Cognizable: 'Yes',
        bailableOrNon_Bailable: 'No',
        trialCourt: 'Magistrate',
        actName: 7,
      },
      {
        section: '20',
        offence: 'Fraud',
        punishment: '2 years',
        cognizableOrNon_Cognizable: 'No',
        bailableOrNon_Bailable: 'Yes',
        trialCourt: 'Sessions',
        actName: 7,
      },
    ];

    component.searchFilters = {
      section: '20',
      offence: '',
      punishment: '',
      cognizableOrNon_Cognizable: '',
      bailableOrNon_Bailable: '',
      trialCourt: '',
    };

    expect(component.filteredDetails.length).toBe(1);
    expect(component.filteredDetails[0].offence).toBe('Fraud');
  });
});
