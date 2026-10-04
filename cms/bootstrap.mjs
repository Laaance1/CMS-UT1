import { schema, relations, publishedFilter } from './schema.mjs';
import { catalog } from '../content/catalog.mjs';
import { importOrder, findExisting } from './import-utils.mjs';
const base = process.env.DIRECTUS_SETUP_URL || 'http://localhost:8055';
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.');
let token;
async function api(path, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Directus ${method} ${path}: ${response.status}. Check service logs; bootstrap can be rerun safely.`);
  return response.status === 204 ? undefined : (await response.json()).data;
}
token = (await api('/auth/login', 'POST', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })).access_token;
const existing = new Set((await api('/collections')).map(c => c.collection));
for (const [collection, fields] of Object.entries(schema)) {
  if (!existing.has(collection)) {
    await api('/collections', 'POST', { collection, meta: { icon: 'school', note: 'Node-RED Complete Guide', sort_field: 'sort_order' }, schema: {}, fields: [{ field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true } }] });
  }
  const current = new Set((await api(`/fields/${collection}`)).map(f => f.field));
  for (const field of fields) if (!current.has(field.field)) await api(`/fields/${collection}`, 'POST', field);
  console.log(`Ready: ${collection}`);
}
const currentRelations = await api('/relations');
for (const [collection, field, related, inverse] of relations) {
  const relatedFields = await api(`/fields/${related}`);
  if (!relatedFields.some(f => f.field === inverse)) await api(`/fields/${related}`, 'POST', { field: inverse, type: 'alias', meta: { interface: 'list-o2m', special: ['o2m'], hidden: related === 'directus_files' } });
  if (!currentRelations.some(r => r.collection === collection && r.field === field)) await api('/relations', 'POST', { collection, field, related_collection: related, meta: { one_field: inverse, sort_field: 'sort_order' }, schema: { on_delete: 'SET NULL' } });
}
// Dedicated public policy: no write methods, no admin token in the website.
let policy = (await api('/policies?limit=-1')).find(p => p.name === 'Node-RED published reading');
if (!policy) policy = await api('/policies', 'POST', { name: 'Node-RED published reading', icon: 'menu_book', admin_access: false, app_access: false });
const access = await api('/access?limit=-1');
if (!access.some(a => a.policy === policy.id && a.role === null && a.user === null)) await api('/access', 'POST', { policy: policy.id, role: null, user: null });
const permissions = await api('/permissions?limit=-1');
const fileFilter = { _or: relations.filter(r => r[2] === 'directus_files').map(([collection,,,inverse]) => ({ [inverse]: { _some: publishedFilter(collection) } })) };
for (const collection of [...Object.keys(schema), 'directus_files']) {
  const fields = collection === 'directus_files' ? ['id','title','description','type','width','height','filename_download','filesize','modified_on'] : ['id', ...schema[collection].map(f => f.field)];
  const record = { policy: policy.id, collection, action: 'read', fields, permissions: collection === 'directus_files' ? fileFilter : publishedFilter(collection) };
  const old = permissions.find(p => p.policy === policy.id && p.collection === collection && p.action === 'read');
  await api(old ? `/permissions/${old.id}` : '/permissions', old ? 'PATCH' : 'POST', record);
}
const folders = await api('/folders?limit=-1');
let root = folders.find(f => f.name === 'Node-RED Guide' && !f.parent);
if (!root) root = await api('/folders', 'POST', { name: 'Node-RED Guide' });
for (const name of ['Interface','Installation','Nodes','MQTT','API','Raspberry Pi','Projects','Troubleshooting']) {
  if (!folders.some(f => f.name === name && f.parent === root.id)) await api('/folders', 'POST', { name, parent: root.id });
}
// Map stable seed IDs to real database IDs so reruns preserve administrator edits.
const maps = {};
for (const collection of importOrder(catalog, relations)) {
  const records=catalog[collection];
  const current = await api(`/items/${collection}?limit=-1`);
  maps[collection] = new Map();
  for (const original of records) {
    const { id, ...data } = original;
    for (const [,field,target] of relations.filter(r=>r[0]===collection&&r[2] in catalog)) if (data[field]!=null) {
      const mapped=maps[target]?.get(data[field]);
      if(mapped==null)throw new Error(`Unresolved ${collection}.${field} seed relationship`);
      data[field]=mapped;
    }
    const found = findExisting(collection,current,data);
    const saved = found || await api(`/items/${collection}`, 'POST', data);
    if(!found)current.push(saved);
    maps[collection].set(id, saved.id);
  }
}
console.log('CMS ready. Existing content was preserved. Add your screenshots and YouTube URLs in Directus.');
