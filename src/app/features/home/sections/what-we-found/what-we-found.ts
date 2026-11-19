import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { useGsap } from '../../../../core/motion/gsap';

@Component({
  selector: 'app-what-we-found',
  templateUrl: './what-we-found.html',
  styleUrl: './what-we-found.css',
})
export class WhatWeFound {
  // ---- Content (inputs, so the parent can change the text) ----
  readonly index = input('01');
  readonly eyebrow = input('What we found');
  readonly value = input(55.2);
  readonly decimals = input(1);
  readonly title = input('The intent-action gap');
  readonly description = input('How often people fall short of their own health goals.');
  readonly quote = input("We know what to do. More than half the time, we don't do it.");
  readonly source = input('Source: [STUDY NAME, YEAR]');

  /** 55.2 -> "5.5 in 10" */
  protected readonly missedLabel = computed(() => `${(this.value() / 10).toFixed(1)} in 10`);

  // ---- Counter ----
  // `null` = show the real value. This is the default, so the number is
  // correct with no JS, with reduced motion and for screen readers.
  private readonly current = signal<number | null>(null);
  protected readonly display = computed(() =>
    (this.current() ?? this.value()).toFixed(this.decimals()),
  );

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Runs only in the browser, after the HTML is on the page.
    afterNextRender(() => {
      const { gsap, ScrollTrigger } = useGsap();
      const mm = gsap.matchMedia();

      // Each rule runs only while its media query matches. If the user
      // prefers reduced motion, neither matches and nothing animates.
      mm.add(
        {
          desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
          mobile: '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          const { desktop } = ctx.conditions as { desktop: boolean };
          this.animate(gsap, desktop);
          // Cleanup when the screen size changes or the component is destroyed
          return () => this.current.set(null);
        },
        this.host.nativeElement,
      );

      // Fonts change text size, so re-measure the scroll positions once they load
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      destroyRef.onDestroy(() => mm.revert());
    });
  }

  private animate(gsap: ReturnType<typeof useGsap>['gsap'], desktop: boolean) {
    const root = this.host.nativeElement;
    const section = root.querySelector('section')!;
    const q = gsap.utils.selector(root);
    const counter = { v: 0 };
    this.current.set(0);

    const tl = gsap.timeline({
      scrollTrigger: desktop
        ? // Desktop: the section sticks for one screen of scrolling,
          // and the animation follows the scroll (forwards and back).
          { trigger: section, start: 'top top', end: '+=100%', pin: true, scrub: 0.6, anticipatePin: 1 }
        : // Mobile: no sticking, just play once when it comes into view.
          { trigger: section, start: 'top 70%', once: true },
    });

    tl.from(q('[data-anim="rule"]'), { scaleX: 0, duration: 0.4, ease: 'power2.out' })
      .from(
        q('[data-anim="line"]'),
        { autoAlpha: 0, y: 28, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
        '<0.1',
      )
      .from(q('[data-anim="number"]'), { yPercent: 70, duration: 1.2, ease: 'power3.out' }, 0.1)
      .to(
        counter,
        {
          v: this.value(),
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => this.current.set(counter.v),
        },
        '<',
      )
      .from(q('[data-anim="tag"]'), { autoAlpha: 0, x: 20, duration: 0.4, ease: 'power2.out' }, '>-0.3');
  }
}