import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <main id="main" class="mx-auto grid min-h-svh max-w-[1440px] grid-cols-12 items-end gap-x-8 px-5 py-16 sm:px-8 lg:px-16">
      <p
        class="col-span-12 font-display text-[clamp(7rem,30vw,22rem)] leading-[0.8] font-light tracking-[-0.05em] text-red lg:col-span-7"
        aria-hidden="true"
      >
        404
      </p>
      <div class="col-span-12 mt-10 flex flex-col gap-5 lg:col-span-4 lg:col-start-9 lg:mt-0 lg:pb-6">
        <h1 class="font-display text-3xl leading-tight font-medium">This page skipped its workout.</h1>
        <p class="max-w-[36ch] text-ink-90">
          We couldn't find what you were looking for. It may have moved, or the link may be wrong.
        </p>
        <a
          routerLink="/"
          class="group inline-flex w-fit items-center gap-3 text-sm font-semibold tracking-wide text-ink uppercase"
        >
          <span class="relative">
            Back to home
            <span
              class="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-30 bg-red transition-transform duration-500 ease-out-expo group-hover:scale-x-100 group-focus-visible:scale-x-100"
            ></span>
          </span>
          <span class="transition-transform duration-500 ease-out-expo group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </main>
  `,
})
export class NotFound {}