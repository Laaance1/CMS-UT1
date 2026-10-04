import { Component, Input, ViewChild, ElementRef, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IconComponent } from './icon.component';
@Component({selector:'app-tutorial-image',standalone:true,imports:[IconComponent],template:`
<figure class="tutorial-image">
  @if(title){<figcaption class="image-heading">@if(stepNumber){<span class="step-chip">{{stepNumber}}</span>}{{title}}</figcaption>}
  @if(image && !failed()) {
    <button class="screenshot-button" (click)="open()" [attr.aria-label]="'Enlarge '+title"><img [src]="asset(image)" [alt]="alt || title" loading="lazy" (error)="failed.set(true)"><span><app-icon name="image"/> Click to enlarge</span></button>
  } @else {
    <div class="screenshot-placeholder"><span class="placeholder-icon"><app-icon name="image"/></span><strong>Node-RED screenshot required</strong><span>Suggested screenshot: {{title || 'Node-RED Editor Home Screen'}}</span><small>Your application screenshot will appear here.</small></div>
  }
  @if(description){<p>{{description}}</p>} @if(caption){<p class="image-caption">{{caption}}</p>}
</figure>
<dialog #preview class="lightbox" (click)="backdrop($event)"><div class="lightbox-toolbar"><strong>{{title}}</strong><button class="button secondary" (click)="preview.close()" aria-label="Close image preview"><app-icon name="close"/> Close</button></div>@if(image){<img [src]="asset(image)" [alt]="alt || title">}<p>{{caption}}</p></dialog>
`})
export class TutorialImageComponent {
 @Input() image?:string; @Input() title=''; @Input() description=''; @Input() caption=''; @Input() alt=''; @Input() stepNumber?:number;
 @ViewChild('preview') preview!:ElementRef<HTMLDialogElement>; failed=signal(false);
 ngOnChanges(){this.failed.set(false);}
 asset(id:string){return `${environment.apiUrl}/assets/${encodeURIComponent(id)}`;}
 open(){this.preview.nativeElement.showModal();}
 backdrop(event:MouseEvent){if(event.target===this.preview.nativeElement)this.preview.nativeElement.close();}
}
