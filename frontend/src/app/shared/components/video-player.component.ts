import { Component, Input, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { youtubeId } from '../../core/youtube';
import { IconComponent } from './icon.component';
@Component({selector:'app-video-player',standalone:true,imports:[IconComponent],template:`@if(embed){<section class="video-section"><div class="eyebrow"><app-icon name="play"/> Watch video tutorial</div><h2>{{title || 'Follow along with this tutorial'}}</h2><div class="video-frame"><iframe [src]="embed" [title]="title || 'Node-RED video tutorial'" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div><div class="video-caption"><p>{{description || 'Prefer watching? Follow along at your own pace.'}}</p><a [href]="watch" target="_blank" rel="noopener noreferrer">Watch on YouTube <app-icon name="external"/></a></div></section>}`})
export class VideoPlayerComponent {
 @Input() url?:string; @Input() title?:string; @Input() description?:string;
 private sanitizer=inject(DomSanitizer);embed:SafeResourceUrl|null=null;watch='';
 ngOnChanges(){const id=youtubeId(this.url);this.embed=id?this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${id}`):null;this.watch=id?`https://www.youtube.com/watch?v=${id}`:'';}
}
