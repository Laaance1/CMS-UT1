import { Component, Input } from '@angular/core';
@Component({selector:'app-flow-diagram',standalone:true,template:`@if(nodes.length){<figure class="teaching-flow"><figcaption>{{title}}</figcaption><ol aria-label="Message flow in order">@for(node of nodes;track $index){<li><span class="flow-position">{{$index+1}}</span><span>{{node}}</span></li>}</ol><p>Follow the message from one step to the next.</p></figure>}`})
export class FlowDiagramComponent {@Input() nodes:string[]=[];@Input() title='Follow the flow';}
