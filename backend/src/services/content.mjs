import { catalog as seed } from '../../../content/catalog.mjs';
import { schema, publishedFilter } from '../../../cms/schema.mjs';
import { BadRequest, Unavailable } from '@feathersjs/errors';
export const collections = Object.keys(schema);
export function filterCatalog(input) {
  const result = Object.fromEntries(collections.map(name => [name, (input[name] || []).filter(r => r.status === 'published')]));
  const modules = new Set(result.modules.map(r => r.id));
  result.lessons = result.lessons.filter(r => modules.has(r.module_id));
  const lessons = new Set(result.lessons.map(r => r.id));
  for (const key of ['tutorial_steps','lesson_images','code_examples']) result[key] = result[key].filter(r => lessons.has(r.lesson_id));
  result.videos = result.videos.filter(r => r.lesson_id == null || lessons.has(r.lesson_id));
  const projects = new Set(result.projects.map(r=>r.id));
  result.project_steps = result.project_steps.filter(r=>projects.has(r.project_id));
  for (const key of collections) result[key].sort((a,b) => (a.sort_order||0)-(b.sort_order||0) || a.id-b.id);
  return result;
}
export function createContentStore({ demo = false, directusUrl = 'http://127.0.0.1:8055', fetcher = fetch } = {}) {
  let cached, expires = 0, pending;
  async function load() {
    if (demo) return filterCatalog(seed);
    if (cached && Date.now() < expires) return cached;
    if (pending) return pending;
    pending = (async () => {
      try {
        const entries = await Promise.all(collections.map(async name => {
          const records = [];
          for (let page=1; ;page++) {
            const query = new URLSearchParams({ limit:'100', page:String(page), fields:['id', ...schema[name].map(f=>f.field)].join(','), sort:'sort_order,id', filter:JSON.stringify(publishedFilter(name)) });
            const response = await fetcher(`${directusUrl}/items/${name}?${query}`, { signal:AbortSignal.timeout(10000) });
            if (!response.ok) throw new Error(`CMS returned ${response.status}`);
            const {data} = await response.json();
            if (!Array.isArray(data)) throw new Error('Invalid CMS response');
            records.push(...data);
            if (data.length<100) break;
            if (page>=100) throw new Error('CMS collection exceeds configured catalog size');
          }
          return [name,records];
        }));
        cached = filterCatalog(Object.fromEntries(entries)); expires = Date.now()+5000; return cached;
      } catch { throw new Unavailable('Published content is temporarily unavailable. Please try again shortly.'); }
      finally { pending = undefined; }
    })();
    return pending;
  }
  return { load, mode: demo?'demo':'directus' };
}
export function searchCatalog(catalog, query) {
  if (typeof query !== 'string' || query.length > 150) throw new BadRequest('Use a search phrase of up to 150 characters.');
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const types = { lessons:['Lesson','/lesson/'], modules:['Module','/learn/'], node_guides:['Node','/nodes/'], projects:['Project','/projects/'], videos:['Video','/videos/'], troubleshooting:['Troubleshooting','/troubleshooting/'] };
  return Object.entries(types).flatMap(([collection,[type,prefix]]) => catalog[collection].filter(item => {
    const text = [item.title,item.name,item.summary,item.description,item.category,item.problem].filter(Boolean).join(' ').toLowerCase();
    return words.every(word=>text.includes(word));
  }).map(item=>({id:`${collection}-${item.id}`,type,title:item.title||item.name,description:item.summary||item.description||item.problem||'',url:`${prefix}${item.slug}`}))).slice(0,100);
}
