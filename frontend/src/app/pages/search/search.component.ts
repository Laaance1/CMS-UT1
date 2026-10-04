import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { SearchService } from '../../core/services/content.service';
import { SearchResult } from '../../core/models/content';
import { IconComponent } from '../../shared/components/icon.component';
@Component({selector:'app-search',standalone:true,imports:[RouterLink,IconComponent],template:`<div class="container search-page"><span class="eyebrow">FIND YOUR NEXT CONNECTION</span><h1>What would you like to learn?</h1><form class="search-form" (submit)="submit($event,input.value)"><app-icon name="search"/><input #input name="q" type="search" [value]="query()" placeholder="Search Node-RED topics..." aria-label="Search Node-RED topics" maxlength="150"><button class="button primary" type="submit">Search</button></form><div class="search-topics"><span>Try a topic:</span>@for(term of ['MQTT','Inject','Raspberry Pi','Installation'];track term){<a routerLink="/search" [queryParams]="{q:term}">{{term}}</a>}</div>@if(loading()){<p role="status">Searching the guide…</p>}@else if(error()){<p role="alert">{{error()}}</p>}@else if(query()){<p class="results-count" role="status">{{results().length}} results for “{{query()}}”</p><div class="search-results">@for(result of results();track result.id){<a class="search-result" [routerLink]="result.url"><span class="eyebrow">{{result.type}}</span><h2>{{result.title}}</h2><p>{{result.description}}</p><app-icon name="chevron"/></a>}@empty{<div class="empty-state"><h2>No matching topics yet.</h2><p>Try a shorter phrase, a node name, or another topic.</p></div>}</div>}</div>`})
export class SearchComponent {
 private route=inject(ActivatedRoute);private router=inject(Router);private search=inject(SearchService);
 query=signal('');results=signal<SearchResult[]>([]);loading=signal(false);error=signal('');
 constructor(){this.route.queryParamMap.pipe(takeUntilDestroyed(),tap(p=>{this.query.set((p.get('q')||'').slice(0,150));this.loading.set(!!this.query());this.error.set('');}),switchMap(()=>this.query()?this.search.search(this.query()).pipe(catchError(()=>{this.error.set('Search is temporarily unavailable. Please try again.');return of([]);})):of([]))).subscribe(results=>{this.results.set(results);this.loading.set(false);});}
 submit(event:Event,q:string){event.preventDefault();void this.router.navigate(['/search'],{queryParams:{q:q.trim()}});}
}
