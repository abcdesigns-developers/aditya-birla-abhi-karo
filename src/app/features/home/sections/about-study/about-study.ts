import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { SplitText } from 'gsap/SplitText';
import { useGsap } from '../../../../core/motion/gsap';

type IconName = 'who' | 'where' | 'what';

interface StudyFact {
  icon: IconName;
  label: string;
  value: number;
  unit: string;
  description: string;
}

@Component({
  selector: 'app-about-study',
  templateUrl: './about-study.html',
  styleUrl: './about-study.css',
})
export class AboutStudy {
  readonly index = input('02');
  readonly eyebrow = input('About the study');
  readonly fieldwork = input('[MONTH YEAR]');
  readonly method = input('[ONLINE SURVEY]');

  readonly facts = input<StudyFact[]>([
    {
      icon: 'who',
      label: 'Who',
      value: 2635,
      unit: 'respondents',
      description: 'Respondents with an annual income of INR 7 lakh and above',
    },
    {
      icon: 'where',
      label: 'Where',
      value: 113,
      unit: 'cities and towns',
      description: 'Across 113 cities and towns in India',
    },
    {
      icon: 'what',
      label: 'What',
      value: 1,
      unit: 'question',
      description:
        'A dive inside the gap between health intent and health action among Indian consumers',
    },
  ]);

  // ---- Counters ----
  // `null` = show the real values (default: correct with no JS / reduced motion).
  private readonly counts = signal<number[] | null>(null);
  private readonly format = new Intl.NumberFormat('en-IN');

  protected shown(i: number): string {
    const value = this.counts()?.[i] ?? this.facts()[i].value;
    return this.format.format(Math.round(value));
  }

  /** The final value; reserves the number's width so counting doesn't shift the layout */
  protected final(i: number): string {
    return this.format.format(this.facts()[i].value);
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const { gsap, ScrollTrigger } = useGsap();
      gsap.registerPlugin(SplitText);
      const mm = gsap.matchMedia();

      mm.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          this.animate(gsap);
          return () => this.counts.set(null);
        },
        this.host.nativeElement,
      );

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      destroyRef.onDestroy(() => mm.revert());
    });
  }

  private animate(gsap: ReturnType<typeof useGsap>['gsap']) {
    const root = this.host.nativeElement;
    const q = gsap.utils.selector(root);

    // 1. Label: red rule draws, text fades in
    gsap
      .timeline({ scrollTrigger: { trigger: q('[data-anim="head"]')[0], start: 'top 85%', once: true } })
      .from(q('[data-anim="head-rule"]'), { scaleX: 0, duration: 0.6, ease: 'power2.out' })
      .from(q('[data-anim="head-text"]'), { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.08 }, '<0.1');

    // 2. Big sentence: each line slides up from behind a mask.
    //    autoSplit re-splits when fonts load or the screen resizes.
    SplitText.create(q('[data-anim="sentence"]')[0], {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 105,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: self.elements[0], start: 'top 80%', once: true },
        }),
    });

    // 3. Side column: heading and fieldwork notes fade in
    gsap.from(q('[data-anim="side"]'), {
      autoAlpha: 0,
      y: 12,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.15,
      scrollTrigger: { trigger: q('[data-anim="details"]')[0], start: 'top 80%', once: true },
    });

    // 4. Each row plays on its own as it scrolls into view
    const values = this.facts().map((f) => f.value);
    // Start big numbers at 0; tiny ones (like "1") just appear, counting 0→1 looks like a glitch
    const counter = values.map((v) => (v >= 10 ? 0 : v));
    this.counts.set([...counter]);

    q('[data-anim="row"]').forEach((row, i) => {
      const r = gsap.utils.selector(row);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: row, start: 'top 85%', once: true },
        defaults: { ease: 'power3.out' },
      });

      tl.from(r('[data-anim="rule"]'), { scaleX: 0, duration: 1.1, ease: 'expo.inOut' });

      // Icon draws itself (dashed strokes fade instead, they already use a dash pattern)
      const shapes = Array.from(row.querySelectorAll<SVGGeometryElement>('svg :is(path, circle)'));
      const drawable = shapes.filter((s) => !s.hasAttribute('stroke-dasharray'));
      drawable.forEach((s) => {
        const len = s.getTotalLength();
        gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
      });
      tl.to(
        drawable,
        { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut', stagger: 0.05, clearProps: 'strokeDasharray,strokeDashoffset' },
        0.25,
      );
      // Only the "What" icon has a dashed stroke; skip the step elsewhere (GSAP warns on empty targets)
      const dashed = shapes.filter((s) => s.hasAttribute('stroke-dasharray'));
      if (dashed.length) tl.from(dashed, { autoAlpha: 0, duration: 0.5 }, '>-0.3');

      tl.from(r('[data-anim="label"]'), { autoAlpha: 0, x: -8, duration: 0.6 }, 0.35)
        // Number rises up out of a mask while counting
        .from(r('[data-anim="number"]'), { yPercent: 100, duration: 1, ease: 'expo.out' }, 0.3)
        .from(r('[data-anim="unit"]'), { autoAlpha: 0, duration: 0.6 }, 0.6)
        .from(r('[data-anim="desc"]'), { autoAlpha: 0, y: 12, duration: 0.8 }, 0.45);

      if (values[i] >= 10) {
        const c = { v: 0 };
        tl.to(
          c,
          {
            v: values[i],
            duration: 1.4,
            ease: 'expo.out',
            onUpdate: () => {
              counter[i] = c.v;
              this.counts.set([...counter]);
            },
          },
          0.3,
        );
      }
    });
  }
}