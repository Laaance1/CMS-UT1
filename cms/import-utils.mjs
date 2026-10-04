// Parents must be imported before children, regardless of file/property order.
export function importOrder(catalog, relations) {
  const pending = new Set(Object.keys(catalog)), ordered=[];
  while(pending.size){
    const ready=[...pending].filter(name=>relations.filter(r=>r[0]===name&&r[2] in catalog&&r[2]!==name).every(r=>!pending.has(r[2])));
    if(!ready.length)throw new Error('Circular seed relationships require a two-pass migration.');
    for(const name of ready){ordered.push(name);pending.delete(name);}
  }
  return ordered;
}
export function findExisting(collection, records, data) {
  if(data.slug)return records.find(r=>r.slug===data.slug);
  if(collection==='site_settings')return records.find(r=>r.website_name===data.website_name);
  if(data.project_id!=null)return records.find(r=>r.project_id===data.project_id&&r.title===data.title);
  return records.find(r=>r.lesson_id===data.lesson_id&&r.title===data.title);
}
