import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutStudy } from './about-study';

describe('AboutStudy', () => {
  let fixture: ComponentFixture<AboutStudy>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AboutStudy] }).compileComponents();
    fixture = TestBed.createComponent(AboutStudy);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('uses an h2 for the section heading', () => {
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('About the study');
  });

  it('shows the three facts with their final numbers', () => {
    const terms = [...el.querySelectorAll('dt')].map((d) => d.textContent?.trim());
    expect(terms).toEqual(['Who', 'Where', 'What']);
    expect(el.textContent).toContain('2,635');
    expect(el.textContent).toContain('113');
  });
});