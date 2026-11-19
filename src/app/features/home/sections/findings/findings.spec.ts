import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Findings } from './findings';

describe('Findings', () => {
  let fixture: ComponentFixture<Findings>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Findings] }).compileComponents();
    fixture = TestBed.createComponent(Findings);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders five cards as buttons', () => {
    expect(el.querySelectorAll('li button').length).toBe(5);
  });

  it('flips a card on click and shows the evidence', async () => {
    const button = el.querySelector<HTMLButtonElement>('li button')!;
    expect(button.getAttribute('aria-pressed')).toBe('false');
    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    const back = button.querySelector('.flip__face--back')!;
    expect(back.getAttribute('aria-hidden')).toBe('false');
    expect(back.textContent).toContain('13.3%');
  });

  it('keeps bold text from the ** markers', () => {
    const strong = el.querySelector('strong');
    expect(strong?.textContent).toBe('13.3%');
  });
});