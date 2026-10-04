// Additive schema. Every field is editable in Directus; content stays out of Angular.
const text = (field, type = 'string', options = {}) => ({ field, type, ...options });
const choices = (field, values) => text(field, 'string', { meta: { interface: 'select-dropdown', options: { choices: values.map(value => ({ text: value, value })) } } });
const media = field => text(field, 'uuid', { meta: { interface: 'file-image', special: ['file'] } });
const relation = field => text(field, 'integer', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } });
const long = fields => fields.split(' ').map(field => text(field, 'text', { meta: { interface: 'input-multiline' } }));
const strings = fields => fields.split(' ').filter(Boolean).map(field => text(field));
const lists = fields => fields.split(' ').map(field => text(field, 'json', { meta: { interface: 'input-code', options: { language: 'json' }, note: 'JSON array of short strings; content may use [{"heading":"...","body":"..."}].' } }));
const status = choices('status', ['draft', 'published', 'archived']);
status.schema = { default_value: 'draft' };
const ordered = [text('sort_order', 'integer', { schema: { default_value: 0 } })];
const published = [...ordered, status];
const difficulty = choices('difficulty', ['Beginner', 'Intermediate', 'Advanced']);
export const schema = {
  categories: [...strings('name slug description icon'), ...published],
  modules: [relation('category_id'), ...strings('title slug description'), text('module_number', 'integer'), media('thumbnail'), difficulty, text('estimated_time'), ...published],
  lessons: [relation('module_id'), relation('category_id'), relation('node_guide_id'), ...strings('title slug summary'), ...lists('content learning_objectives prerequisites flow_diagram'), difficulty, text('estimated_time'), media('featured_image'), ...strings('image_caption youtube_url youtube_title youtube_description'), ...long('practice expected_result'), text('source_url'), ...published, text('published_at', 'timestamp')],
  tutorial_steps: [relation('lesson_id'), text('step_number', 'integer'), text('title'), ...long('description command code expected_output'), media('image'), ...strings('image_title image_caption alt_text youtube_url language'), ...long('tip warning'), ...published],
  lesson_images: [relation('lesson_id'), media('image'), ...strings('title description caption alt_text'), choices('image_type', ['interface','tutorial','example','result','diagram','other']), ...lists('callouts'), ...published],
  node_guides: [...strings('name slug category description'), ...long('purpose input_description output_description configuration example common_errors practice'), media('image'), media('configuration_image'), media('example_image'), text('youtube_url'), ...published],
  projects: [...strings('title slug description estimated_time'), difficulty, ...lists('requirements content flow_diagram'), text('featured','boolean',{schema:{default_value:false}}), media('thumbnail'), ...strings('youtube_url source_url'), ...long('what_you_will_build practice expected_result troubleshooting'), ...published],
  project_steps: [relation('project_id'), text('step_number','integer'), text('title'), ...long('description code expected_result tip warning'), media('image'), ...strings('image_title image_caption alt_text language youtube_url'), ...published],
  code_examples: [relation('lesson_id'), text('title'), choices('language', ['bash','powershell','javascript','json','typescript','sql','html','css']), ...long('code description'), ...published],
  troubleshooting: [...strings('title slug category'), ...long('problem cause possible_cause solution commands'), media('image'), text('youtube_url'), ...published],
  videos: [...strings('title slug description youtube_url'), media('thumbnail'), text('category'), relation('lesson_id'), text('duration'), text('featured', 'boolean', { schema: { default_value: false } }), ...published, text('published_at', 'timestamp')],
  site_settings: [...strings('website_name tagline'), media('logo'), media('favicon'), ...strings('hero_title hero_description footer_text homepage_intro editor_description'), ...lists('features editor_highlights'), media('editor_image'), ...published]
};
export const relations = [
  ['modules','category_id','categories','modules'],
  ['lessons','node_guide_id','node_guides','lessons'], ['project_steps','project_id','projects','project_steps'],
  ['lessons','module_id','modules','lessons'], ['lessons','category_id','categories','lessons'],
  ...['tutorial_steps','lesson_images','code_examples','videos'].map(name => [name,'lesson_id','lessons',name]),
  ...Object.entries(schema).flatMap(([collection, fields]) => fields.filter(f => f.type === 'uuid').map(f => [collection, f.field, 'directus_files', `guide_${collection}_${f.field}`]))
];
export function publishedFilter(collection) {
  const conditions = [{ status: { _eq: 'published' } }];
  if (collection === 'lessons') conditions.push({ module_id: { status: { _eq: 'published' } } });
  if (['tutorial_steps','lesson_images','code_examples'].includes(collection)) conditions.push({ lesson_id: { _and: [{ status: { _eq: 'published' } }, { module_id: { status: { _eq: 'published' } } }] } });
  if (collection === 'videos') conditions.push({ _or: [{ lesson_id: { _null: true } }, { lesson_id: { _and: [{ status: { _eq: 'published' } }, { module_id: { status: { _eq: 'published' } } }] } }] });
  if (collection === 'project_steps') conditions.push({project_id:{status:{_eq:'published'}}});
  return { _and: conditions };
}
