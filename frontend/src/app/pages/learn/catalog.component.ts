import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DirectusService } from '../../core/services/content.service';
import { ContentItem } from '../../core/models/content';
import { ProgressService } from '../../core/services/progress.service';
import { IconComponent } from '../../shared/components/icon.component';
import { VideoCardComponent } from '../../shared/components/video-card.component';
import { youtubeId } from '../../core/youtube';
import { ProjectCardComponent } from '../../shared/components/project-card.component';
@Component({selector:'app-catalog',standalone:true,imports:[RouterLink,IconComponent,VideoCardComponent,ProjectCardComponent],templateUrl:'./catalog.component.html'})
export class CatalogComponent {
 cms=inject(DirectusService);progress=inject(ProgressService);route=inject(ActivatedRoute);kind=signal('learn');slug=signal('');filter=signal('All');
 constructor(){this.route.data.pipe(takeUntilDestroyed()).subscribe(d=>{this.kind.set(d['kind']||'learn');this.filter.set('All');});this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(p=>{this.slug.set(p.get('module')||'');this.filter.set('All');});}
 get module(){const slug=this.kind()==='installation'?'installation':this.kind()==='raspberry-pi'?'raspberry-pi':this.slug();return this.cms.items('modules').find(m=>m.slug===slug);}
 get title(){if(this.module)return this.module.title;return ({learn:'Your Node-RED learning path',nodes:'A node for every idea.',tutorials:'Learn it. Build it. Make it yours.',videos:'Node-RED Video Tutorials',projects:'Put your knowledge to work.',troubleshooting:'Get your flow moving again.'} as Record<string,string>)[this.kind()]||'Explore the guide';}
 get description(){return this.module?.description||({learn:'Start from zero. Follow the path, or pick up where curiosity takes you.',nodes:'Meet the building blocks. Understand what goes in, what happens, and what comes out.',tutorials:'Practical, step-by-step lessons with examples and expected results.',videos:'Watch at your own pace, then put the lesson into practice.',projects:'Small, hands-on projects that turn concepts into something real.',troubleshooting:'Clear explanations and practical checks for common problems.'} as Record<string,string>)[this.kind()];}
 get baseItems():ContentItem[]{if(this.module)return this.cms.items('lessons').filter(l=>l.module_id===this.module!.id);switch(this.kind()){case'nodes':return this.cms.items('node_guides');case'videos':return this.cms.items('videos').filter(v=>youtubeId(v.youtube_url));case'projects':return this.cms.items('projects');case'troubleshooting':return this.cms.items('troubleshooting');case'tutorials':return this.cms.items('lessons');default:return this.cms.items('modules');}}
 get categories(){if(this.module||this.kind()==='learn')return [];return ['All',...new Set(this.baseItems.map(i=>this.category(i)).filter(Boolean))];}
 category(item:ContentItem){return item.category|| (this.kind()==='videos'?'Getting Started':this.kind()==='projects'?item.difficulty:this.cms.items('modules').find(m=>m.id===item.module_id)?.title)||'';}
 get items(){return this.filter()==='All'?this.baseItems:this.baseItems.filter(i=>this.category(i)===this.filter());}
 link(item:ContentItem){const prefix=this.module||this.kind()==='tutorials'?'/lesson':({learn:'/learn',nodes:'/nodes',projects:'/projects',videos:'/videos',troubleshooting:'/troubleshooting'} as Record<string,string>)[this.kind()];return [prefix,item.slug];}
 lessons(id:number){return this.cms.items('lessons').filter(l=>l.module_id===id);}
 completion(id:number){const lessons=this.lessons(id);return lessons.length?Math.round(100*lessons.filter(l=>this.progress.completed().includes(l.slug!)).length/lessons.length):0;}
}
