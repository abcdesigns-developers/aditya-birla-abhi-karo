import {
  Component,
  DestroyRef,
  ElementRef,
  WritableSignal,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { SplitText } from 'gsap/SplitText';
import { CountUp } from '../../../../shared/directives/count-up';
import { FlipCard } from '../../../../shared/ui/flip-card/flip-card';
import { useGsap } from '../../../../core/motion/gsap';

type IconName = 'week' | 'stress' | 'care' | 'day' | 'balance';

export interface Finding {
  num: string;
  icon: IconName;
  title: string;
  stat: string;
  statLabel: string;
  /** Wrap words in **double stars** to make them bold */
  body: string;
  /** Show the evidence side when the page loads */
  startFlipped?: boolean;
}

interface CardView extends Finding {
  parts: { text: string; bold: boolean }[];
  flipped: WritableSignal<boolean>;
  wide: boolean;
  /** Tailwind classes, worked out here because responsive class names
      like `lg:w-[360px]` can't be used in [class.x] bindings */
  css: {
    item: string;
    face: string;
    side: string;
    main: string;
    sideHint: string;
    mainHint: string;
  };
}

function classesFor(layout: string, wide: boolean): CardView['css'] {
  return {
    item: layout,
    face: wide ? 'lg:flex-row lg:gap-12' : '',
    side: wide ? 'lg:w-[360px] lg:shrink-0' : 'flex-1',
    main: wide ? 'lg:flex-1 lg:self-end' : '',
    sideHint: wide ? 'hidden lg:flex' : 'hidden',
    mainHint: wide ? 'flex lg:hidden' : 'flex',
  };
}

// Desktop layout: 7|5, 5|7, then one full-width strip
const LAYOUT = [
  { layout: 'lg:col-span-7 lg:min-h-[400px]', wide: false },
  { layout: 'lg:col-span-5 lg:min-h-[400px]', wide: false },
  { layout: 'lg:col-span-5 lg:min-h-[460px]', wide: false },
  { layout: 'lg:col-span-7 lg:min-h-[460px]', wide: false },
  { layout: 'lg:col-span-12 lg:min-h-[300px]', wide: true },
];

const FINDINGS: Finding[] = [
  {
    num: '01',
    icon: 'week',
    title: 'Most people know what they want. They just do not keep it up.',
    stat: '13.3%',
    statLabel: 'kept all four health goals every day last week',
    body: 'Every respondent set their own health goal in all four areas. Only **13.3%** kept all four every day last week. On **55% of the week**, at least one goal slips.',
  },
  {
    num: '02',
    icon: 'stress',
    title: 'Managing stress gives way first, and few are working on it',
    stat: '34.3%',
    statLabel: 'the widest intent-action gap of the four areas',
    body: 'Managing stress has the widest intent-action gap of the four areas (**34.3%**). It is the first to slip for 30.8% of people, more than any other. Yet only **8.1%** say it is what they most want to fix.',
  },
  {
    num: '03',
    icon: 'care',
    title: 'Self-care is what people want. Caring for others is what fills the day.',
    stat: '8 in 10',
    statLabel: 'put family needs before their own health',
    body: 'Even among people who say their health comes first, **8 in 10** prioritise family needs over their own health. About **1 in 4** feel guilty taking time for themselves. **Health is felt as care for self, in a life organised around care for others.**',
  },
  {
    num: '04',
    icon: 'day',
    title: 'What matters most is control over the shape of your day',
    stat: '15% wider',
    startFlipped: true,
    statLabel: 'gap for people whose work hours or place keep changing',
    body: 'Where people live makes little difference. Whether their day has a fixed shape does. The intent-action gap is **61.6%** for people whose work hours or place keep changing, against **53.4%** for others: **15% wider**. It is 64.5% for people whose food is decided by someone else, against 52.9% for others.',
  },
  {
    num: '05',
    icon: 'balance',
    title: '“Everything in moderation” sounds wise, but in practice it backfires',
    stat: '9% smaller',
    statLabel: 'gap for people who follow a few fixed rules',
    body: '“Moderation is key” is good advice in principle. In practice it turns every meal and every evening into a fresh decision, and the healthy choice often loses. People who prefer **a few fixed rules** have an intent-action gap about **9% smaller** than similar people who prefer moderation. And people who are hard on themselves after a slip have a gap about **9% wider**.',
  },
];

/** "a **b** c" -> [{a}, {b, bold}, {c}] */
function toParts(body: string) {
  return body.split('**').map((text, i) => ({ text, bold: i % 2 === 1 }));
}

@Component({
  selector: 'app-findings',
  imports: [FlipCard, CountUp],
  templateUrl: './findings.html',
  styleUrl: './findings.css',
})
export class Findings {
  readonly index = input('03');
  readonly eyebrow = input('What we found');
  readonly heading = input('Five things the data told us.');

  protected readonly cards: CardView[] = FINDINGS.map((f, i) => ({
    ...f,
    wide: LAYOUT[i].wide,
    css: classesFor(LAYOUT[i].layout, LAYOUT[i].wide),
    parts: toParts(f.body),
    flipped: signal(f.startFlipped ?? false),
  }));

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
          const q = gsap.utils.selector(this.host.nativeElement);

          gsap
            .timeline({ scrollTrigger: { trigger: q('[data-anim="head"]')[0], start: 'top 85%', once: true } })
            .from(q('[data-anim="head-rule"]'), { scaleX: 0, duration: 0.6, ease: 'power2.out' })
            .from(
              q('[data-anim="head-text"]'),
              { autoAlpha: 0, y: 24, duration: 0.8, ease: 'power3.out', stagger: 0.1 },
              '<0.1',
            );

          // Heading: each line slides up from behind a mask
          SplitText.create(q('[data-anim="heading"]')[0], {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 105,
                duration: 1,
                ease: 'expo.out',
                stagger: 0.1,
                scrollTrigger: { trigger: self.elements[0], start: 'top 85%', once: true },
              }),
          });

          // Cards rise in, in reading order, as each group scrolls into view.
          // Inside each card: the icon draws itself, then the number and title follow.
          const cards = q('app-flip-card');
          gsap.set(cards, { autoAlpha: 0, y: 48 });
          ScrollTrigger.batch(cards, {
            start: 'top 88%',
            once: true,
            onEnter: (batch) =>
              batch.forEach((card, i) => this.revealCard(gsap, card as HTMLElement, i * 0.12)),
          });
        },
        this.host.nativeElement,
      );

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      destroyRef.onDestroy(() => mm.revert());
    });
  }

  private revealCard(gsap: ReturnType<typeof useGsap>['gsap'], card: HTMLElement, delay: number) {
    const q = gsap.utils.selector(card);
    const tl = gsap.timeline({ delay });

    tl.to(card, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' });

    // Line icons: draw each stroke. Dashed shapes already use a dash
    // pattern, so those (and the filled red accents) fade in instead.
    const shapes = Array.from(
      card.querySelectorAll<SVGGeometryElement>('[data-anim="icon"] :is(path, circle, rect)'),
    );
    const drawable = shapes.filter((s) => !s.hasAttribute('stroke-dasharray'));
    const others = shapes.filter((s) => s.hasAttribute('stroke-dasharray'));
    drawable.forEach((s) => {
      const len = s.getTotalLength();
      gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
    });

    tl.to(
      drawable,
      { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.06, clearProps: 'strokeDasharray,strokeDashoffset' },
      '<0.2',
    );
    // Not every icon has red accents or dashed strokes; skip those steps (GSAP warns on empty targets)
    const accents = q('.findings__accent');
    if (accents.length) tl.from(accents, { fillOpacity: 0, duration: 0.4, stagger: 0.08 }, '>-0.4');
    if (others.length) tl.from(others, { autoAlpha: 0, duration: 0.6 }, accents.length ? '<' : '>-0.4');

    tl.from(q('[data-anim="card-num"]'), { autoAlpha: 0, x: 16, duration: 0.6, ease: 'power3.out' }, 0.3)
      .from(q('[data-anim="card-title"]'), { autoAlpha: 0, y: 20, duration: 0.8, ease: 'power3.out' }, 0.35)
      .from(q('.findings__hint'), { autoAlpha: 0, duration: 0.5 }, 0.6);
  }
}