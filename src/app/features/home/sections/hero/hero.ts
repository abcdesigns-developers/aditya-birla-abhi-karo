import { Component, DestroyRef, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { useGsap } from '../../../../core/motion/gsap';

/** Cube colours. Red is where the A box starts; yellow is where it ends (also set in hero.css). */
const RED = { top: '#ea2f3e', front: '#c8202c', right: '#7d1218', inner: '#4a0a0e', letter: '#ffffff' };
const YELLOW = { top: '#ffe592', front: '#ffd65c', right: '#d9a12b', inner: '#9c6a0c', letter: '#8b151b' };

/** How far below its final spot the A box starts, in cube edges (level with the row, in the middle). */
const A_START_DROP = 1.85;

/** Letter timing, in seconds */
const CLIMB = 0.5; // to climb up out of the box
const FLY = 0.95; // to fly from the box to its place

interface Point {
  x: number;
  y: number;
}
interface Home extends Point {
  w: number;
  h: number;
}

@Component({
  selector: 'app-hero',
  imports: [NgTemplateOutlet],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  readonly title = input('India Health Gap Index');
  readonly tag = input('A Consumer Insights Report');
  readonly summary = input('Inside the gap between health intent and health action among Indian consumers.');
  readonly date = input('November 2026');
  readonly dateTime = input('2026-11');

  protected readonly left = ['H', 'E'];
  protected readonly right = ['L', 'T', 'H'];
  /** The rest of ACTION, written beside the A box */
  protected readonly word = ['C', 'T', 'I', 'O', 'N'];

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const root = this.host.nativeElement;
      const stage = root.querySelector<HTMLElement>('[data-anim="stage"]')!;
      const lines = Array.from(root.querySelectorAll<SVGLineElement>('[data-anim="link"]'));
      const pick = (name: string) => root.querySelector<HTMLElement>(`[data-anchor="${name}"]`)!;
      // Each dotted line joins a corner of A to a corner of its neighbour cube
      const pairs = [
        [pick('a-left'), pick('e')],
        [pick('a-right'), pick('l')],
      ] as const;

      // Lines follow the real (3D-projected) corners, so they stay attached however the cubes move
      const drawLines = () => {
        const box = stage.getBoundingClientRect();
        pairs.forEach(([from, to], i) => {
          const a = from.getBoundingClientRect();
          const b = to.getBoundingClientRect();
          lines[i].setAttribute('x1', `${a.left - box.left}`);
          lines[i].setAttribute('y1', `${a.top - box.top}`);
          lines[i].setAttribute('x2', `${b.left - box.left}`);
          lines[i].setAttribute('y2', `${b.top - box.top}`);
        });
      };

      drawLines();
      const resize = new ResizeObserver(drawLines);
      resize.observe(stage);
      document.fonts?.ready.then(drawLines);

      const { gsap } = useGsap();
      const mm = gsap.matchMedia();

      mm.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          this.play(gsap, root, drawLines);
          // When motion is turned off mid-visit, GSAP puts everything back; redraw the lines there
          return () => requestAnimationFrame(drawLines);
        },
        root,
      );

      destroyRef.onDestroy(() => {
        mm.revert();
        resize.disconnect();
      });
    });
  }

  /**
   * The sequence:
   *  1. Only the red A box, low in the middle.
   *  2. (0.5s) It rises, its lid flaps swing open and it turns yellow.
   *  3. One by one, in a random order, the letters of HEALTH climb up out of the box, come towards us
   *     (growing) and fly to their places.
   *  4. The flaps close and the box turns to face us; CTION unfolds beside it: ACTION.
   */
  private play(gsap: ReturnType<typeof useGsap>['gsap'], root: HTMLElement, drawLines: () => void) {
    const q = gsap.utils.selector(root);
    const stage = q('[data-anim="stage"]')[0];
    const aSlot = q('[data-anim="a"]')[0];
    const aCube = q('[data-anim="a-cube"]')[0];
    const [leftGroup] = q('[data-anim="group"]');
    const cubes = q('[data-anim="group"] .hero__slot'); // H, E, L, T, H
    const word = q('[data-anim="word-letter"]');

    // One cube edge in pixels right now (the whole scene is measured in cubes)
    const s = aCube.offsetWidth;

    // ---- Measure everything in its final place, before anything is moved ----
    const st = stage.getBoundingClientRect();
    const measure = (el: Element): Home => {
      const r = el.getBoundingClientRect();
      return { x: r.left - st.left + r.width / 2, y: r.top - st.top + r.height / 2, w: r.width, h: r.height };
    };
    const box = measure(aSlot);
    const homes = cubes.map(measure);

    const colours = (c: typeof RED) => ({
      '--c-top': c.top,
      '--c-front': c.front,
      '--c-right': c.right,
      '--c-inner': c.inner,
      '--c-letter': c.letter,
    });

    // ---- Starting state: only the red A box, low in the middle; every letter tucked inside it ----
    gsap.set(aSlot, { y: A_START_DROP * s });
    gsap.set(aCube, { ...colours(RED), '--rx': '-26deg', '--ry': '-38deg', '--flap': '0deg' });
    cubes.forEach((cube, i) =>
      // Deep inside the box: centred on it, a little low, and small (far away from us)
      gsap.set(cube, { autoAlpha: 0, x: box.x - homes[i].x, y: box.y - homes[i].y + 0.15 * s, scale: 0.28 }),
    );
    gsap.set(word, { autoAlpha: 0, rotationY: -95 });
    gsap.set(q('[data-anim="links"]'), { autoAlpha: 0 });

    // Headline text settles in during the 0.5s wait
    gsap.from(q('[data-anim="hero-text"]'), { autoAlpha: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.08 });
    gsap.from(q('[data-anim="summary"]'), { autoAlpha: 0, y: 20, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.3 });
    gsap.from(q('[data-anim="summary-rule"]'), { scaleX: 0, duration: 0.9, ease: 'expo.out', delay: 0.5 });

    const tl = gsap
      .timeline({ delay: 0.5, onUpdate: drawLines })
      // 2. Box rises; its shadow on the ground shrinks and fades
      .to(aSlot, { y: 0, duration: 1, ease: 'power3.inOut' }, 0)
      .fromTo(
        q('[data-anim="shadow"]'),
        { scale: 1.05, autoAlpha: 1 },
        { scale: 0.75, autoAlpha: 0.6, duration: 1, ease: 'power3.inOut' },
        0,
      )
      // Both lid flaps swing open sideways with a little settle; the box turns yellow at the same time
      .to(aCube, { '--flap': '125deg', duration: 0.75, ease: 'back.out(1.5)' }, 0.75)
      .to(aCube, { ...colours(YELLOW), duration: 0.8, ease: 'sine.inOut' }, 0.75);

    // 3. Letters come out one at a time, in a random order with uneven gaps.
    // The box's walls are measured once it has finished rising (it doesn't move again until step 4).
    let walls: Point[] = [];
    tl.call(() => (walls = this.wallOutline(root, st)), [], 1.0);

    const order = gsap.utils.shuffle(cubes.map((_, i) => i));
    let lastStart = 0;
    order.forEach((i, k) => {
      const cube = cubes[i];
      const home = homes[i];
      const side = leftGroup.contains(cube) ? -1 : 1;
      const at = 1.1 + k * 0.19 + gsap.utils.random(0, 0.08);
      lastStart = Math.max(lastStart, at);
      // While inside, the letter is drawn in front of the box but with the walls cut out of it,
      // so it only shows through the opening, like something rising out of a box.
      const clip = () => this.clipBehind(gsap, cube, home, walls);

      tl.set(cube, { autoAlpha: 1 }, at)
        // Climb up through the opening, growing as it comes towards us, with a small tilt to its side
        .to(
          cube,
          {
            x: box.x - home.x + side * 0.22 * s,
            y: box.y - home.y - s,
            scale: 0.55,
            rotation: side * gsap.utils.random(4, 9),
            duration: CLIMB,
            ease: 'power2.out',
            onStart: clip,
            onUpdate: clip,
          },
          at,
        )
        // Fully out: stop clipping, fly to its place and grow to full size
        .set(cube, { clipPath: 'none' }, at + CLIMB)
        .to(cube, { x: 0, y: 0, scale: 1, rotation: 0, duration: FLY, ease: 'power3.inOut' }, at + CLIMB);
    });

    const allOut = lastStart + CLIMB;
    const landed = allOut + FLY;

    // 4. Flaps close, the box turns to face us, and CTION unfolds out of its right side
    tl.to(aCube, { '--flap': '0deg', duration: 0.55, ease: 'power2.inOut' }, allOut + 0.15)
      .to(aCube, { '--rx': '-10deg', '--ry': '-14deg', duration: 1, ease: 'power3.inOut' }, landed - 0.1)
      .to(q('[data-anim="links"]'), { autoAlpha: 1, duration: 0.6 }, landed - 0.1)
      .to(word, { autoAlpha: 1, rotationY: 0, duration: 0.6, ease: 'back.out(1.4)', stagger: 0.07 }, landed + 0.45);
  }

  /** The outline of the A box's two visible walls (front + right), in stage pixels. */
  private wallOutline(root: HTMLElement, st: DOMRect): Point[] {
    return ['fl-t', 'fr-t', 'br-t', 'br-b', 'fr-b', 'fl-b'].map((name) => {
      const r = root.querySelector(`[data-corner="${name}"]`)!.getBoundingClientRect();
      return { x: r.left - st.left, y: r.top - st.top };
    });
  }

  /**
   * Cut the box's walls out of a letter cube, so whatever part of it is still "inside" the box is hidden.
   * clip-path works in the cube's own (moved, scaled, tilted) coordinates, so on every frame each wall
   * corner is converted from stage pixels into the cube's local space.
   */
  private clipBehind(gsap: ReturnType<typeof useGsap>['gsap'], cube: HTMLElement, home: Home, walls: Point[]) {
    if (!walls.length) return;
    const x = gsap.getProperty(cube, 'x') as number;
    const y = gsap.getProperty(cube, 'y') as number;
    const scale = gsap.getProperty(cube, 'scale') as number;
    const turn = (-(gsap.getProperty(cube, 'rotation') as number) * Math.PI) / 180;
    const cos = Math.cos(turn);
    const sin = Math.sin(turn);

    const local = (p: Point) => {
      // Relative to the cube's current centre, then undo its tilt and scale
      const dx = p.x - (home.x + x);
      const dy = p.y - (home.y + y);
      const lx = (dx * cos - dy * sin) / scale + home.w / 2;
      const ly = (dx * sin + dy * cos) / scale + home.h / 2;
      return `${lx.toFixed(1)} ${ly.toFixed(1)}`;
    };

    // A huge rectangle with the walls as a hole in it (even-odd fill)
    const hole = walls.map(local).join(' L ');
    cube.style.clipPath = `path(evenodd, "M -9999 -9999 H 9999 V 9999 H -9999 Z M ${hole} Z")`;
  }
}
