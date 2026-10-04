import { Component, inject, signal, ElementRef, ViewChild, effect } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DirectusService } from '../../core/services/content.service';
import { ProgressService } from '../../core/services/progress.service';
import { Collection } from '../../core/models/content';
import { TutorialImageComponent } from '../../shared/components/tutorial-image.component';
import { VideoPlayerComponent } from '../../shared/components/video-player.component';
import { CodeBlockComponent } from '../../shared/components/code-block.component';
import { InfoBoxComponent } from '../../shared/components/info-box.component';
import { IconComponent } from '../../shared/components/icon.component';
import { youtubeId } from '../../core/youtube';
import { TutorialStepComponent } from '../../shared/components/tutorial-step.component';
import { FlowDiagramComponent } from '../../shared/components/flow-diagram.component';
@Component({selector:'app-lesson',standalone:true,imports:[RouterLink,TutorialImageComponent,VideoPlayerComponent,CodeBlockComponent,InfoBoxComponent,IconComponent,TutorialStepComponent,FlowDiagramComponent],templateUrl:'./lesson.component.html'})
export class LessonComponent {
 cms=inject(DirectusService);progress=inject(ProgressService);route=inject(ActivatedRoute);slug=signal('');collection=signal<Collection>('lessons');
 @ViewChild('drawer') drawer?:ElementRef<HTMLDialogElement>;
 private title=inject(Title);private meta=inject(Meta);
 constructor(){this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(p=>{this.slug.set(p.get('slug')||'');this.drawer?.nativeElement.close();});this.route.data.pipe(takeUntilDestroyed()).subscribe(d=>this.collection.set(d['collection']||'lessons'));effect(()=>{const item=this.item;if(item){this.title.setTitle(`${item.title||item.name} · Node-RED Guide`);this.meta.updateTag({name:'description',content:item.summary||item.description||item.problem||'Learn Node-RED step by step.'});}});}
 get item(){return this.cms.items(this.collection()).find(i=>i.slug===this.slug());}
 get module(){return this.cms.items('modules').find(m=>m.id===this.item?.module_id);}
 get steps(){if(this.collection()==='projects')return this.cms.items('project_steps').filter(s=>s.project_id===this.item?.id);return this.cms.items('tutorial_steps').filter(s=>s.lesson_id===this.item?.id&&this.collection()==='lessons');}
 get nodeGuide(){return this.collection()==='node_guides'?this.item:this.collection()==='lessons'?this.cms.items('node_guides').find(g=>g.id===this.item?.node_guide_id):undefined;}
 get images(){return this.cms.items('lesson_images').filter(s=>s.lesson_id===this.item?.id&&this.collection()==='lessons');}
 get codes(){return this.cms.items('code_examples').filter(s=>s.lesson_id===this.item?.id&&this.collection()==='lessons');}
 get objectives(){return this.item?.learning_objectives||[];}
 get prerequisites(){return this.item?.prerequisites||this.item?.requirements||[];}
 get sections(){return Array.isArray(this.item?.content)?this.item!.content!:[];}
 get siblings(){const items=this.cms.items(this.collection());if(this.collection()!=='lessons')return items;const order=new Map(this.cms.items('modules').map((m,i)=>[m.id,i]));return [...items].sort((a,b)=>(order.get(a.module_id!)??0)-(order.get(b.module_id!)??0)||(a.sort_order||0)-(b.sort_order||0));}
 get index(){return this.siblings.findIndex(i=>i.id===this.item?.id);}
 get previous(){return this.index>0?this.siblings[this.index-1]:undefined;}
 get next(){return this.index>=0?this.siblings[this.index+1]:undefined;}
 get prefix(){return ({lessons:'/lesson',node_guides:'/nodes',projects:'/projects',videos:'/videos',troubleshooting:'/troubleshooting'} as Partial<Record<Collection,string>>)[this.collection()]||'/lesson';}
 get toc(){const entries=[{id:'overview',label:'Overview'}];if(this.item?.what_you_will_build)entries.push({id:'build',label:'What you will build'});if(this.item?.flow_diagram?.length)entries.push({id:'flow',label:'Flow diagram'});if(this.item?.troubleshooting)entries.push({id:'project-troubleshooting',label:'Troubleshooting'});if(this.objectives.length)entries.push({id:'objectives',label:'What you’ll learn'});if(this.prerequisites.length)entries.push({id:'prerequisites',label:'Before you start'});this.sections.forEach((s,i)=>entries.push({id:'section-'+i,label:s.heading}));if(this.images.length)entries.push({id:'gallery',label:'A closer look'});if(youtubeId(this.item?.youtube_url || this.nodeGuide?.youtube_url))entries.push({id:'watch',label:'Video tutorial'});if(this.steps.length)entries.push({id:'steps',label:'Step-by-step guide'});if(this.nodeGuide)entries.push({id:'configuration',label:'Configuration'},{id:'example',label:'Example flow'});if(this.collection()==='troubleshooting')entries.push({id:'solution',label:'Solution'});if(this.codes.length)entries.push({id:'code',label:'Code examples'});if(this.item?.expected_result)entries.push({id:'result',label:'Expected result'});if(this.item?.practice)entries.push({id:'practice',label:'Practice'});return entries;}
 lessons(id:number){return this.cms.items('lessons').filter(l=>l.module_id===id);}
 scroll(id:string,event:Event){event.preventDefault();document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 top(){window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 source(url?:string){try{return url&&new URL(url).protocol==='https:'?url:null;}catch{return null;}}
 relatedLesson(){return this.cms.items('lessons').find(l=>l.id===this.item?.lesson_id);}
}
