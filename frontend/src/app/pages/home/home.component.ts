import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DirectusService } from '../../core/services/content.service';
import { ProgressService } from '../../core/services/progress.service';
import { IconComponent } from '../../shared/components/icon.component';
import { TutorialImageComponent } from '../../shared/components/tutorial-image.component';
import { VideoCardComponent } from '../../shared/components/video-card.component';
import { youtubeId } from '../../core/youtube';
import { ProjectCardComponent } from '../../shared/components/project-card.component';
@Component({selector:'app-home',standalone:true,imports:[RouterLink,IconComponent,TutorialImageComponent,VideoCardComponent,ProjectCardComponent],templateUrl:'./home.component.html'})
export class HomeComponent {
 cms=inject(DirectusService);progress=inject(ProgressService);
 get settings(){return this.cms.items('site_settings').at(0);}
 get features(){return this.settings?.features||[];}
 icons=['book','terminal','layers','flow','chip','code','code','globe','wifi','layers','chip','terminal','layers','flow','tool','globe'];
 lessons(id:number){return this.cms.items('lessons').filter(l=>l.module_id===id);}
 completed(id:number){return this.lessons(id).filter(l=>this.progress.completed().includes(l.slug!)).length;}
 featured(){return this.cms.items('videos').filter(v=>v.featured&&youtubeId(v.youtube_url)).slice(0,3);}
 featuredProjects(){return this.cms.items('projects').filter(p=>p.featured).slice(0,4);}
}
