import { feathers } from '@feathersjs/feathers';
import express, { rest, json, errorHandler } from '@feathersjs/express';
import helmet from 'helmet';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createContentStore, searchCatalog } from './services/content.mjs';
export function createApp(options={}) {
  const app=express(feathers());
  const store=createContentStore(options);
  app.use(helmet());
  app.use(json({limit:'32kb'}));
  app.configure(rest());
  app.get('/api/health',async (_req,res)=>{
    try { await store.load(); res.json({status:'ok',content:store.mode}); }
    catch {res.status(503).json({status:'unavailable',content:store.mode});}
  });
  app.use('/api/catalog',{async find(){return {mode:store.mode,data:await store.load()};}},{methods:['find']});
  app.use('/api/search',{async find(params){return searchCatalog(await store.load(),params.query?.q??'');}},{methods:['find']});
  // Only image assets reachable through Directus' anonymous publication policy are served.
  app.get('/api/assets/:id',async(req,res)=>{
    if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(req.params.id)) return res.sendStatus(404);
    if(options.demo) return res.sendStatus(404);
    try {
      const upstream=await fetch(`${options.directusUrl||'http://127.0.0.1:8055'}/assets/${req.params.id}`,{signal:AbortSignal.timeout(15000)});
      const type=upstream.headers.get('content-type')||'';
      if(!upstream.ok||!/^image\/(png|jpeg|webp|gif|avif)(;|$)/i.test(type)) return res.sendStatus(404);
      res.set({'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
      await pipeline(Readable.fromWeb(upstream.body),res);
    } catch { if(!res.headersSent) res.sendStatus(503); else res.destroy(); }
  });
  app.use(errorHandler({logger:false}));
  return app;
}
