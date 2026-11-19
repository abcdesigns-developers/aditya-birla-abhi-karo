import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhatWeFound } from './what-we-found';

describe('WhatWeFound', () => {
  let fixture: ComponentFixture<WhatWeFound>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WhatWeFound] }).compileComponents();
    fixture = TestBed.createComponent(WhatWeFound);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the final value without animation', () => {
    expect(el.textContent).toContain('55.2');
  });

  it('gives screen readers the value once', () => {
    expect(el.querySelector('.sr-only')?.textContent?.trim()).toBe('55.2 percent');
  });

  it('shows the "in 10" label', () => {
    expect(el.textContent).toContain('5.5 in 10');
  });

  it('uses an h2 for the section heading', () => {
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('What we found');
  });
});