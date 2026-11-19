import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CountUp } from './count-up';

@Component({
  imports: [CountUp],
  template: `<span [appCountUp]="text()" [countWhen]="on()"></span>`,
})
class Host {
  text = signal('8 in 10');
  on = signal(false);
}

describe('CountUp', () => {
  it('shows the exact text (no motion in tests)', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('8 in 10');
    fixture.componentInstance.on.set(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('8 in 10');
  });
});