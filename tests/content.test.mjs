import test from 'node:test';
import { once } from 'node:events';
import assert from 'node:assert/strict';
import { catalog } from '../content/catalog.mjs';
import { filterCatalog, createContentStore, searchCatalog } from '../backend/src/services/content.mjs';
import { youtubeId } from '../frontend/src/app/core/youtube.ts';
import { createApp } from '../backend/src/app.mjs';
import { importOrder, findExisting } from '../cms/import-utils.mjs';
import { relations, publishedFilter } from '../cms/schema.mjs';
test('project steps are hidden when the project or step is not published',()=>{
 const input=structuredClone(catalog);const hidden=input.projects[0].id;input.projects[0].status='archived';
 const draft=input.project_steps.find(s=>s.project_id!==hidden);draft.status='draft';
 const result=filterCatalog(input);assert(!result.project_steps.some(s=>s.project_id===hidden||s.id===draft.id));assert(result.project_steps.length>0);
 assert.deepEqual(publishedFilter('project_steps'),{_and:[{status:{_eq:'published'}},{project_id:{status:{_eq:'published'}}}]});
});
test('CMS import order resolves parents before children and scopes repeated step titles by project',()=>{
 const order=importOrder(catalog,relations);
 for(const [child,,parent] of relations.filter(r=>r[2] in catalog))assert(order.indexOf(parent)<order.indexOf(child));
 const records=[{id:1,project_id:1,title:'Test the result'},{id:2,project_id:2,title:'Test the result'}];
 assert.equal(findExisting('project_steps',records,{project_id:2,title:'Test the result'}).id,2);
 assert.equal(findExisting('project_steps',records,{project_id:3,title:'Test the result'}),undefined);
});
test('YouTube parser allows exact supported URLs and rejects iframe injection and deceptive hosts',()=>{
 for(const url of ['https://www.youtube.com/watch?v=dQw4w9WgXcQ','https://youtu.be/dQw4w9WgXcQ?t=20','https://m.youtube.com/shorts/dQw4w9WgXcQ','https://youtube.com/embed/dQw4w9WgXcQ'])assert.equal(youtubeId(url),'dQw4w9WgXcQ');
 for(const url of ['javascript:alert(1)','https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ','https://youtube.com@evil.test/watch?v=dQw4w9WgXcQ','http://youtube.com/watch?v=dQw4w9WgXcQ','https://youtube.com:444/watch?v=dQw4w9WgXcQ','https://youtu.be/dQw4w9WgXcQ/extra','https://youtube.com/watch?v=bad','<iframe src="https://youtube.com"></iframe>',null,''])assert.equal(youtubeId(url),null);
});
test('draft module hides lessons, steps, images, code and related videos',()=>{
 const input=structuredClone(catalog);input.modules[0].status='draft';const id=input.lessons[0].id;
 input.videos.push({id:1,status:'published',lesson_id:id},{id:2,status:'published',lesson_id:null},{id:3,status:'draft'});
 const result=filterCatalog(input);
 assert(!result.lessons.some(l=>l.module_id===1));assert(!result.tutorial_steps.some(s=>s.lesson_id===id));assert(!result.lesson_images.some(s=>s.lesson_id===id));assert.deepEqual(result.videos.map(v=>v.id),[2]);
});
test('draft child records never appear with a published parent',()=>{
 const input=structuredClone(catalog);input.tutorial_steps[0].status='draft';const id=input.tutorial_steps[0].id;
 assert(!filterCatalog(input).tutorial_steps.some(s=>s.id===id));
});
test('search spans lessons, modules, nodes, projects and troubleshooting',()=>{
 const results=searchCatalog(filterCatalog(catalog),'MQTT');for(const type of ['Lesson','Module','Node','Project','Troubleshooting'])assert(results.some(r=>r.type===type),type);
 assert.deepEqual(searchCatalog(filterCatalog(catalog),'  '),[]);assert.throws(()=>searchCatalog(catalog,{}));
});
test('CMS errors are explicit and never silently replaced with seed content',async()=>{
 const store=createContentStore({fetcher:async()=>({ok:false,status:403})});await assert.rejects(store.load(),/temporarily unavailable/);
});
test('CMS reads page through results and never attach administrator credentials',async()=>{
 let lessonPages=0;
 const store=createContentStore({fetcher:async(url,options)=>{
   assert(!options.headers?.Authorization);const parsed=new URL(url),name=parsed.pathname.split('/').pop();let data=[];
   if(name==='modules')data=[{id:1,status:'published'}];
   if(name==='lessons'){lessonPages++;data=parsed.searchParams.get('page')==='1'?Array.from({length:100},(_,i)=>({id:i+1,module_id:1,status:'published'})):[{id:101,module_id:1,status:'published'}];}
   return {ok:true,json:async()=>({data})};
 }});assert.equal((await store.load()).lessons.length,101);assert.equal(lessonPages,2);
});
test('Feathers API serves catalog/search and rejects public writes',async()=>{
 const app=createApp({demo:true});const server=await app.listen(0,'127.0.0.1');if(!server.listening)await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
 try{
  const health=await fetch(`${base}/api/health`);assert.equal(health.status,200);
  const response=await fetch(`${base}/api/catalog`);assert.equal(response.status,200);assert.equal((await response.json()).mode,'demo');
  const search=await fetch(`${base}/api/search?q=MQTT`);assert((await search.json()).length>0);
  for(const method of ['POST','PATCH','DELETE']){const response=await fetch(`${base}/api/catalog`,{method,headers:{'Content-Type':'application/json'},body:method==='DELETE'?undefined:'{}'});assert(response.status>=400);}
  assert.equal((await fetch(`${base}/api/assets/not-a-file`)).status,404);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
