import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, interval, fromEvent, merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { Catalog, Collection, ContentItem, SearchResult } from '../models/content';
@Injectable({providedIn:'root'})
export class DirectusService {
  private http=inject(HttpClient);
  catalog=signal<Catalog|null>(null); loading=signal(false); error=signal(''); refreshError=signal(''); mode=signal('');
  private pending?:Promise<void>; private loadedAt=0;
  constructor(){merge(interval(15000),fromEvent(document,'visibilitychange')).pipe(takeUntilDestroyed()).subscribe(()=>{if(document.visibilityState==='visible')void this.load(true);});}
  load(force=false):Promise<void> {
    if(this.pending) return this.pending;
    if(!force&&this.catalog()&&Date.now()-this.loadedAt<5000) return Promise.resolve();
    this.loading.set(true);this.error.set('');
    this.pending=firstValueFrom(this.http.get<{mode:string;data:Catalog}>(`${environment.apiUrl}/catalog`))
      .then(result=>{this.catalog.set(result.data);this.mode.set(result.mode);this.refreshError.set('');this.loadedAt=Date.now();})
      .catch(()=>{if(this.catalog())this.refreshError.set('The latest updates are temporarily unavailable. You can keep reading the loaded content.');else this.error.set('We couldn’t load the guide. Please try again.');})
      .finally(()=>{this.loading.set(false);this.pending=undefined;});
    return this.pending;
  }
  items(collection:Collection):ContentItem[]{return this.catalog()?.[collection]||[];}
}
@Injectable({providedIn:'root'}) export class LessonService {private cms=inject(DirectusService);all(){return this.cms.items('lessons');}bySlug(slug:string){return this.all().find(l=>l.slug===slug);}}
@Injectable({providedIn:'root'}) export class ModuleService {private cms=inject(DirectusService);all(){return this.cms.items('modules');}}
@Injectable({providedIn:'root'}) export class ProjectService {private cms=inject(DirectusService);all(){return this.cms.items('projects');}}
@Injectable({providedIn:'root'}) export class NodeGuideService {private cms=inject(DirectusService);all(){return this.cms.items('node_guides');}}
@Injectable({providedIn:'root'}) export class VideoService {private cms=inject(DirectusService);all(){return this.cms.items('videos');}}
@Injectable({providedIn:'root'}) export class SearchService {private http=inject(HttpClient);search(q:string){return this.http.get<SearchResult[]>(`${environment.apiUrl}/search`,{params:{q}});}}
