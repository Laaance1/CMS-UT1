import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentItem } from '../../core/models/content';
import { IconComponent } from './icon.component';
import { environment } from '../../../environments/environment';
@Component({selector:'app-project-card',standalone:true,imports:[RouterLink,IconComponent],template:`<a class="project-card card" [routerLink]="['/projects',project.slug]"><div class="project-card-visual">@if(project.thumbnail){<img [src]="asset(project.thumbnail)" [alt]="project.title || 'Node-RED project'" loading="lazy">}@else{<app-icon name="flow"/><span>{{project.flow_diagram?.join(' → ') || 'A hands-on Node-RED project'}}</span>}</div><div class="project-card-copy"><span class="eyebrow">{{project.difficulty}}</span><h3>{{project.title}}</h3><p>{{project.description}}</p><div class="project-card-bottom"><span><app-icon name="clock"/>{{project.estimated_time || 'At your own pace'}}</span><span class="text-link">Build this project <app-icon name="chevron"/></span></div></div></a>`})
export class ProjectCardComponent {@Input({required:true})project!:ContentItem;asset(id:string){return `${environment.apiUrl}/assets/${encodeURIComponent(id)}`;}}
