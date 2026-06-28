-- Curator-seeded catalog (mirrors lib/catalog/seed.ts). Runs as owner, bypassing
-- RLS. GLB urls point at Khronos sample assets standing in for R2-hosted files.
insert into models (id, name, slug, width_mm, height_mm, depth_mm, source, glb_url, tags, visibility)
values
  ('11111111-1111-4111-8111-111111111111','Water Bottle','water-bottle',74,230,74,'catalog','https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb','{bottle,drink,kitchen}','public'),
  ('22222222-2222-4222-8222-222222222222','Avocado','avocado',70,100,70,'catalog','https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb','{food,fruit,kitchen}','public'),
  ('33333333-3333-4333-8333-333333333333','Rubber Duck','rubber-duck',85,100,85,'catalog','https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb','{toy,duck,bath}','public'),
  ('44444444-4444-4444-8444-444444444444','Boom Box','boom-box',400,250,130,'catalog','https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BoomBox/glTF-Binary/BoomBox.glb','{electronics,speaker,stereo}','public'),
  ('55555555-5555-4555-8555-555555555555','Street Lantern','street-lantern',320,1900,320,'catalog','https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb','{outdoor,light,lamp}','public'),
  ('66666666-6666-4666-8666-666666666666','Damaged Helmet','damaged-helmet',280,300,300,'catalog','https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb','{gear,helmet,sci-fi}','public')
on conflict (id) do nothing;
