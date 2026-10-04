import { Component, Input, signal } from '@angular/core';
import { IconComponent } from './icon.component';
@Component({selector:'app-code-block',standalone:true,imports:[IconComponent],template:`<div class="code-block"><div class="code-toolbar"><span>{{language}}</span><button (click)="copy()"><app-icon name="copy"/> <span aria-live="polite">{{state()}}</span></button></div><pre tabindex="0" [attr.aria-label]="language+' code example'"><code>{{code}}</code></pre></div>`})
export class CodeBlockComponent {
 @Input() code='';@Input() language='bash';state=signal('Copy');private timer?:ReturnType<typeof setTimeout>;
 async copy(){
  try{
   if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(this.code);
   else{
    // The professor's trusted-LAN HTTP URL may not expose the Clipboard API.
    const previous=document.activeElement as HTMLElement|null;
    const field=document.createElement('textarea');field.value=this.code;field.style.cssText='position:fixed;left:-10000px;top:0';document.body.appendChild(field);field.select();
    try{if(!document.execCommand('copy'))throw new Error('Copy unavailable');}finally{field.remove();previous?.focus();}
   }
   this.state.set('Copied!');
  }catch{this.state.set('Select code to copy');}
  clearTimeout(this.timer);this.timer=setTimeout(()=>this.state.set('Copy'),2500);
 }
 ngOnDestroy(){clearTimeout(this.timer);}
}
