import { Directive, effect, input, signal, untracked } from '@angular/core';
import { prefersReducedMotion, useGsap } from '../../core/motion/gsap';

/**
 * Counts up the first number inside a piece of text.
 *   <span [appCountUp]="'13.3%'" [countWhen]="isVisible()"></span>
 * "13.3%" -> 0.0% ... 13.3%   ·   "8 in 10" -> 0 in 10 ... 8 in 10
 *
 * The element always ends on (and starts with) the exact text,
 * so screen readers and reduced-motion users get the real value.
 */
@Directive({
  selector: '[appCountUp]',
  host: { '[textContent]': 'shown()' },
})
export class CountUp {
  readonly appCountUp = input.required<string>();
  /** Runs the count each time this turns true */
  readonly countWhen = input(true);
  readonly duration = input(1.1);
  readonly delay = input(0.25);

  protected readonly shown = signal('');
  private tween?: { kill: () => void };

  constructor() {
    effect(() => {
      const text = this.appCountUp();
      const on = this.countWhen();
      untracked(() => this.run(text, on));
    });
  }

  private run(text: string, on: boolean) {
    this.tween?.kill();
    this.shown.set(text);

    const match = text.match(/\d[\d,]*(\.\d+)?/);
    if (!on || !match || typeof window === 'undefined' || prefersReducedMotion()) return;

    const raw = match[0];
    const target = parseFloat(raw.replace(/,/g, ''));
    const decimals = match[1] ? match[1].length - 1 : 0;
    const before = text.slice(0, match.index);
    const after = text.slice((match.index ?? 0) + raw.length);
    const format = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: raw.includes(','),
    });

    const { gsap } = useGsap();
    const counter = { v: 0 };
    this.shown.set(before + format.format(0) + after);
    this.tween = gsap.to(counter, {
      v: target,
      duration: this.duration(),
      delay: this.delay(),
      ease: 'power2.out',
      onUpdate: () => this.shown.set(before + format.format(counter.v) + after),
      onComplete: () => this.shown.set(text),
    });
  }
}