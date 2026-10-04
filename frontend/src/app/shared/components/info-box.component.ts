import { Component, Input } from '@angular/core';
@Component({selector:'app-tip, app-warning, app-info, app-success, app-example',standalone:true,template:`<aside class="info-box" [attr.data-kind]="kind"><strong>{{label}}</strong><div><ng-content/></div></aside>`})
export class InfoBoxComponent {@Input() kind='info';@Input() label='Good to know';}
