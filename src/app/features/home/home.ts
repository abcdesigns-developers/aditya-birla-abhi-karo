import { Component } from '@angular/core';
import { AboutStudy } from './sections/about-study/about-study';
import { Findings } from './sections/findings/findings';
import { Hero } from './sections/hero/hero';
import { WhatWeFound } from './sections/what-we-found/what-we-found';

@Component({
  selector: 'app-home',
  imports: [Hero, WhatWeFound, AboutStudy, Findings],
  templateUrl: './home.html',
})
export class Home {}