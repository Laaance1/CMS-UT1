import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({selector:'app-not-found',standalone:true,imports:[RouterLink],template:`<div class="container empty-state"><span class="eyebrow">404</span><h1>This connection leads nowhere.</h1><p>The page may have moved. Find your next lesson in the learning path.</p><a class="button primary" routerLink="/learn">Explore lessons</a></div>`}) export class NotFoundComponent {}
