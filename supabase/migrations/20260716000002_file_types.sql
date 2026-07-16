-- Align file types with Breeze design: flowchart, wireframe, sticky, doc
alter table public.files drop constraint files_type_check;
alter table public.files add constraint files_type_check
  check (type in ('flowchart', 'wireframe', 'sticky', 'doc'));
