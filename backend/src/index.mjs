import { createApp } from './app.mjs';
const demo=process.argv.includes('--demo')||process.env.CONTENT_MODE==='demo';
if(demo&&process.env.NODE_ENV==='production') throw new Error('Demo content is disabled in production.');
const port=Number(process.env.BACKEND_PORT||3030);
const app=createApp({demo,directusUrl:process.env.DIRECTUS_URL||'http://127.0.0.1:8055'});
const server=await app.listen(port,process.env.NODE_ENV==='production'?'0.0.0.0':'127.0.0.1');
console.log(`Feathers API: http://localhost:${port}/api/health (${demo?'explicit demo preview':'Directus content'})`);
for(const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>server.close(()=>process.exit(0)));
