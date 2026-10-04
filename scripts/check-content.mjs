import assert from 'node:assert/strict';
import { catalog } from '../content/catalog.mjs';
import { schema, relations } from '../cms/schema.mjs';
for(const [collection,records] of Object.entries(catalog)){
  const ids=new Set(),slugs=new Set();const allowed=new Set(['id',...schema[collection].map(f=>f.field)]);
  for(const item of records){
    assert(!ids.has(item.id),`${collection}: duplicate ID ${item.id}`);ids.add(item.id);
    if(item.slug){assert(!slugs.has(item.slug),`${collection}: duplicate slug ${item.slug}`);slugs.add(item.slug);}
    for(const field of Object.keys(item))assert(allowed.has(field),`${collection}: field ${field} not in schema`);
    for(const [,field,target] of relations.filter(r=>r[0]===collection&&r[2] in catalog))if(item[field]!=null)assert(catalog[target].some(r=>r.id===item[field]),`${collection}: broken ${field}`);
  }
}
for(const lesson of catalog.lessons){assert(lesson.summary&&lesson.practice&&lesson.expected_result);assert(catalog.tutorial_steps.some(s=>s.lesson_id===lesson.id));}
for(const project of catalog.projects){assert(project.estimated_time&&project.what_you_will_build&&project.troubleshooting);assert(project.flow_diagram.length>1);assert(catalog.project_steps.filter(s=>s.project_id===project.id).length>=4);}
console.log(Object.entries(catalog).map(([key,items])=>`${key}: ${items.length}`).join('\n'));
console.log('Content fields, unique IDs/slugs, lesson structure and relationships passed.');
