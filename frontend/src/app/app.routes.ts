import { Routes } from '@angular/router';
const catalog=()=>import('./pages/learn/catalog.component').then(m=>m.CatalogComponent);
const lesson=()=>import('./pages/lesson/lesson.component').then(m=>m.LessonComponent);
export const routes:Routes=[
 {path:'',loadComponent:()=>import('./pages/home/home.component').then(m=>m.HomeComponent),title:'Node-RED Complete Guide'},
 {path:'learn',loadComponent:catalog,data:{kind:'learn'},title:'Learning path · Node-RED Guide'},
 {path:'learn/:module',loadComponent:catalog,data:{kind:'learn'}},
 {path:'lesson/:slug',loadComponent:lesson,data:{collection:'lessons'}},
 {path:'installation',loadComponent:catalog,data:{kind:'installation'},title:'Installation · Node-RED Guide'},
 {path:'nodes',loadComponent:catalog,data:{kind:'nodes'},title:'Node reference · Node-RED Guide'},
 {path:'nodes/:slug',loadComponent:lesson,data:{collection:'node_guides'}},
 {path:'tutorials',loadComponent:catalog,data:{kind:'tutorials'},title:'Tutorials · Node-RED Guide'},
 {path:'tutorials/:slug',loadComponent:lesson,data:{collection:'lessons'}},
 {path:'videos',loadComponent:catalog,data:{kind:'videos'},title:'Video tutorials · Node-RED Guide'},
 {path:'videos/:slug',loadComponent:lesson,data:{collection:'videos'}},
 {path:'projects',loadComponent:catalog,data:{kind:'projects'},title:'Projects · Node-RED Guide'},
 {path:'projects/:slug',loadComponent:lesson,data:{collection:'projects'}},
 {path:'raspberry-pi',loadComponent:catalog,data:{kind:'raspberry-pi'},title:'Raspberry Pi · Node-RED Guide'},
 {path:'troubleshooting',loadComponent:catalog,data:{kind:'troubleshooting'},title:'Troubleshooting · Node-RED Guide'},
 {path:'troubleshooting/:slug',loadComponent:lesson,data:{collection:'troubleshooting'}},
 {path:'search',loadComponent:()=>import('./pages/search/search.component').then(m=>m.SearchComponent),title:'Search · Node-RED Guide'},
 {path:'about',loadComponent:()=>import('./pages/about/about.component').then(m=>m.AboutComponent),title:'About · Node-RED Guide'},
 {path:'**',loadComponent:()=>import('./pages/not-found.component').then(m=>m.NotFoundComponent),title:'Page not found · Node-RED Guide'}
];
