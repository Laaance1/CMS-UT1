import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DirectusService } from './core/services/content.service';
import { IconComponent } from './shared/components/icon.component';
@Component({selector:'app-root',standalone:true,imports:[RouterLink,RouterLinkActive,RouterOutlet,IconComponent],template:`
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="header-inner">
  <a class="brand" routerLink="/" aria-label="Node-RED Complete Guide home"><span class="brand-mark"><app-icon name="flow"/></span><span>NODE-RED<span class="brand-sub">COMPLETE GUIDE</span></span></a>
  <nav class="desktop-nav" aria-label="Main navigation">@for(link of allLinks;track link.path){<a [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{exact:link.path==='/'}">{{link.label}}</a>}</nav>
  <button class="header-search" (click)="router.navigate(['/search'])" aria-label="Search Node-RED topics"><app-icon name="search"/><span>Search the guide</span><kbd>/</kbd></button>
  <button class="menu-button" (click)="menu.set(!menu())" [attr.aria-expanded]="menu()" aria-controls="mobile-nav" aria-label="Toggle navigation"><app-icon [name]="menu()?'close':'menu'"/></button>
</div>
@if(menu()){<nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation">@for(link of allLinks;track link.path){<a [routerLink]="link.path" (click)="menu.set(false)">{{link.label}}</a>}<a routerLink="/search" (click)="menu.set(false)">Search topics</a></nav>}
</header>
@if(cms.mode()==='demo'){<div class="demo-banner">Curriculum preview · Connect Directus to publish your own screenshots and videos.</div>}
@if(cms.refreshError()){<div class="refresh-notice" role="status">{{cms.refreshError()}} <button (click)="cms.load(true)">Retry update</button></div>}
<main id="main" tabindex="-1"><router-outlet/></main>
<footer class="site-footer"><div class="footer-grid"><div><a class="brand" routerLink="/"><span class="brand-mark"><app-icon name="flow"/></span><span>NODE-RED<span class="brand-sub">COMPLETE GUIDE</span></span></a><p>{{cms.items('site_settings')[0]?.footer_text || 'An independent educational Node-RED learning platform.'}}</p></div><div><strong>Keep learning</strong><a routerLink="/learn">Learning path</a><a routerLink="/installation">Installation</a><a routerLink="/nodes">Node reference</a><a routerLink="/tutorials">Tutorials</a></div><div><strong>Build something</strong><a routerLink="/projects">Projects</a><a routerLink="/raspberry-pi">Raspberry Pi</a><a routerLink="/videos">Video tutorials</a><a routerLink="/troubleshooting">Troubleshooting</a></div><div><strong>Resources</strong><a href="https://nodered.org/docs/" target="_blank" rel="noopener noreferrer">Node-RED documentation</a><a href="https://www.raspberrypi.com/documentation/" target="_blank" rel="noopener noreferrer">Raspberry Pi</a><a href="https://mqtt.org/" target="_blank" rel="noopener noreferrer">MQTT</a><a routerLink="/about">About this project</a></div></div><div class="footer-bottom"><span>Made for learning. Built for doing.</span><span>Independent guide · Not affiliated with the Node-RED project</span></div></footer>
`})
export class AppComponent {
 cms=inject(DirectusService);router=inject(Router);menu=signal(false);
 links=[{path:'/',label:'Home'},{path:'/learn',label:'Learn'},{path:'/nodes',label:'Nodes'},{path:'/tutorials',label:'Tutorials'},{path:'/videos',label:'Videos'},{path:'/projects',label:'Projects'}];
 allLinks=[...this.links,{path:'/installation',label:'Installation'},{path:'/raspberry-pi',label:'Raspberry Pi'},{path:'/troubleshooting',label:'Troubleshooting'},{path:'/about',label:'About'}];
 constructor(){void this.cms.load();this.router.events.pipe(takeUntilDestroyed()).subscribe(e=>{if(e instanceof NavigationEnd){this.menu.set(false);void this.cms.load();}});}
}
