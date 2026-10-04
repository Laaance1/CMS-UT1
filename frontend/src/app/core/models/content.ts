export interface Section { heading:string; body:string; }
export interface ContentItem {
  id:number; title?:string; name?:string; slug?:string; status:string; sort_order?:number;
  description?:string; summary?:string; category?:string; module_id?:number; category_id?:number; lesson_id?:number; project_id?:number; node_guide_id?:number;
  module_number?:number; difficulty?:string; estimated_time?:string; thumbnail?:string; featured_image?:string; image?:string;
  image_title?:string; image_caption?:string; caption?:string; alt_text?:string; image_type?:string; callouts?:string[];
  youtube_url?:string; youtube_title?:string; youtube_description?:string; duration?:string; featured?:boolean;
  content?:Section[]; learning_objectives?:string[]; prerequisites?:string[]; requirements?:string[];
  step_number?:number; command?:string; code?:string; language?:string; expected_output?:string; tip?:string; warning?:string;
  practice?:string; expected_result?:string; source_url?:string; purpose?:string; input_description?:string; output_description?:string;
  configuration?:string; example?:string; common_errors?:string; configuration_image?:string; example_image?:string;
  problem?:string; cause?:string; possible_cause?:string; solution?:string; commands?:string; flow_diagram?:string[];what_you_will_build?:string;troubleshooting?:string;
  website_name?:string; tagline?:string; hero_title?:string; hero_description?:string; footer_text?:string; editor_image?:string;homepage_intro?:string;editor_description?:string;editor_highlights?:string[];features?:{icon:string;title:string;text:string;path:string}[];
}
export type Collection = 'categories'|'modules'|'lessons'|'tutorial_steps'|'lesson_images'|'node_guides'|'projects'|'project_steps'|'code_examples'|'troubleshooting'|'videos'|'site_settings';
export type Catalog = Record<Collection, ContentItem[]>;
export interface SearchResult {id:string;type:string;title:string;description:string;url:string;}
