import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hero } from './hero';

describe('Hero', () => {
  let fixture: ComponentFixture<Hero>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Hero] }).compileComponents();
    fixture = TestBed.createComponent(Hero);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('uses the report title as the page h1', () => {
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('India Health Gap Index');
  });

  it('spells HEALTH across six cubes, with A on its own', () => {
    const letters = [...el.querySelectorAll('.cube__front')].map((f) => f.textContent?.trim());
    expect(letters).toEqual(['H', 'E', 'L', 'T', 'H', 'A']);
  });

  it('writes CTION beside the A box, to spell ACTION', () => {
    const word = [...el.querySelectorAll('[data-anim="word-letter"]')].map((l) => l.textContent?.trim()).join('');
    expect(word).toBe('CTION');
  });

  it('gives the cube scene one label for screen readers', () => {
    expect(el.querySelector('[role="img"]')?.getAttribute('aria-label')).toContain('HEALTH');
  });

  it('marks up the date', () => {
    expect(el.querySelector('time')?.getAttribute('datetime')).toBe('2026-11');
  });
});
