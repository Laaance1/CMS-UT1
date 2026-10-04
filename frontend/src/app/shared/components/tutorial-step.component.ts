import { Component, Input } from '@angular/core';
import { ContentItem } from '../../core/models/content';
import { TutorialImageComponent } from './tutorial-image.component';
import { CodeBlockComponent } from './code-block.component';
import { VideoPlayerComponent } from './video-player.component';
import { InfoBoxComponent } from './info-box.component';
@Component({selector:'app-tutorial-step',standalone:true,imports:[TutorialImageComponent,CodeBlockComponent,VideoPlayerComponent,InfoBoxComponent],template:`<section class="tutorial-step" [id]="'step-'+step.id"><div class="step-heading"><span class="step-number">{{step.step_number! < 10 ? '0':''}}{{step.step_number}}</span><h3>{{step.title}}</h3></div><div class="step-content"><p>{{step.description}}</p>@if(step.command || step.code){<app-code-block [code]="step.command || step.code || ''" [language]="step.language || 'bash'"/>}<app-tutorial-image [image]="step.image" [title]="step.image_title || step.title || ''" [caption]="step.image_caption || ''" [alt]="step.alt_text || ''"/><app-video-player [url]="step.youtube_url" [title]="step.title"/>@if(step.expected_output || step.expected_result){<app-success kind="success" label="Expected result">{{step.expected_output || step.expected_result}}</app-success>}@if(step.tip){<app-tip kind="tip" label="Tip">{{step.tip}}</app-tip>}@if(step.warning){<app-warning kind="warning" label="Watch out">{{step.warning}}</app-warning>}</div></section>`})
export class TutorialStepComponent {@Input({required:true})step!:ContentItem;}
