import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentItem } from '../../core/models/content';
import { environment } from '../../../environments/environment';
import { IconComponent } from './icon.component';
@Component({selector:'app-video-card',standalone:true,imports:[RouterLink,IconComponent],template:`<a class="card video-card" [routerLink]="['/videos',video.slug]"><div class="video-thumbnail">@if(video.thumbnail){<img [src]="asset(video.thumbnail)" [alt]="video.title || 'Video thumbnail'" loading="lazy">}<span class="play-circle"><app-icon name="play"/></span>@if(video.duration){<span class="duration">{{video.duration}}</span>}</div><div class="card-body"><span class="eyebrow">{{video.category || 'Tutorial'}}</span><h3>{{video.title}}</h3><p>{{video.description}}</p><span class="text-link">Watch video</span></div></a>`})
export class VideoCardComponent {@Input({required:true}) video!:ContentItem;asset(id:string){return `${environment.apiUrl}/assets/${encodeURIComponent(id)}`;}}
