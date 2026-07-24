import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../auth.service';
import { ActSectionDtlsListing } from './act-section-dtls-listing';

describe('ActSectionDtlsListing', () => {
  it('filters records to the requested act id and paginates results', () => {
    const component = new ActSectionDtlsListing(
      {} as HttpClient,
      {} as AuthService,
      { bypassSecurityTrustHtml: (value: string) => value } as DomSanitizer,
      { paramMap: of({ get: () => '1' }) } as ActivatedRoute,
    );

    component.actSectionDtlsList = [
      {
        sectionId: 1,
        actId: 1,
        sectionNo: 1,
        chapterName: 'Chapter A',
        bareAct: 'Act A',
        meaning: 'Meaning 1',
        objective: 'Objective 1',
        illustration: 'Illustration 1',
        exception: 'Exception 1',
        caseStudyId: 10,
      },
      {
        sectionId: 2,
        actId: 2,
        sectionNo: 2,
        chapterName: 'Chapter B',
        bareAct: 'Act B',
        meaning: 'Meaning 2',
        objective: 'Objective 2',
        illustration: 'Illustration 2',
        exception: 'Exception 2',
        caseStudyId: 20,
      },
    ] as any;

    component.selectedActId = 1;

    expect(component.filteredData.length).toBe(1);
    expect(component.filteredData[0].sectionNo).toBe(1);
    expect(component.paginatedData.length).toBe(1);
    expect(component.totalPages).toBe(1);
  });
});
