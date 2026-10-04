import { Injectable, signal } from '@angular/core';
@Injectable({providedIn:'root'}) export class ProgressService {
  completed=signal<string[]>([]); available=signal(true);
  constructor(){try{const value=JSON.parse(localStorage.getItem('node-red-guide-progress')||'[]');if(Array.isArray(value))this.completed.set(value.filter(v=>typeof v==='string'));}catch{this.available.set(false);}}
  toggle(slug:string){const next=this.completed().includes(slug)?this.completed().filter(s=>s!==slug):[...this.completed(),slug];this.completed.set(next);try{localStorage.setItem('node-red-guide-progress',JSON.stringify(next));}catch{this.available.set(false);}}
}
