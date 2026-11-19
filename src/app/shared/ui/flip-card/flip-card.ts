import { Component, model } from '@angular/core';

/**
 * A card that turns over when clicked (or Enter / Space).
 *
 * Usage:
 *   <app-flip-card [(flipped)]="isFlipped">
 *     <div flipFront>...front...</div>
 *     <div flipBack>...back...</div>
 *   </app-flip-card>
 *
 * Only use phrasing elements (span, strong, svg...) inside, because the
 * whole card is a <button>. Style them with `display: block/flex`.
 */
@Component({
  selector: 'app-flip-card',
  templateUrl: './flip-card.html',
  styleUrl: './flip-card.css',
})
export class FlipCard {
  /** Two-way bindable: [(flipped)] */
  readonly flipped = model(false);

  protected toggle() {
    this.flipped.update((v) => !v);
  }
}