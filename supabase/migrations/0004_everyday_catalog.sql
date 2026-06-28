-- Expand the catalog with everyday objects (mirrors lib/catalog/seed.ts).
-- These have no GLB asset; the client renders them as a calibrated primitive
-- (box/cylinder/sphere/cone) at their true real-world dimensions.

-- 1. Placeholder primitive hint for GLB-less catalog items.
alter table models
  add column if not exists shape text
  check (shape is null or shape in ('box','cylinder','sphere','cone'));

-- 2. Raise the search/browse cap so the larger catalog is fully listable.
create or replace function search_models(query text)
returns setof models language sql stable as $$
  select * from models
  where visibility = 'public'
    and (
      query = ''
      or search_tsv @@ websearch_to_tsquery('english', query)
      or name % query                              -- pg_trgm similarity
    )
  order by greatest(
      ts_rank(search_tsv, websearch_to_tsquery('english', coalesce(nullif(query,''), 'x'))),
      similarity(name, query)
    ) desc
  limit 200;
$$;

-- 3. Everyday objects (glb_url null → rendered as `shape`).
insert into models (id, name, slug, width_mm, height_mm, depth_mm, source, shape, tags, visibility)
values
  ('c0000000-0000-4000-8000-000000000001','Dining Chair','dining-chair',460,900,520,'catalog','box','{chair,furniture,seat}','public'),
  ('c0000000-0000-4000-8000-000000000002','Office Chair','office-chair',660,1150,660,'catalog','box','{chair,office,furniture}','public'),
  ('c0000000-0000-4000-8000-000000000003','Bar Stool','bar-stool',400,750,400,'catalog','cylinder','{stool,seat,furniture}','public'),
  ('c0000000-0000-4000-8000-000000000004','Dining Table','dining-table',1600,750,900,'catalog','box','{table,furniture,dining}','public'),
  ('c0000000-0000-4000-8000-000000000005','Coffee Table','coffee-table',1100,450,600,'catalog','box','{table,furniture,living}','public'),
  ('c0000000-0000-4000-8000-000000000006','Office Desk','office-desk',1400,740,700,'catalog','box','{desk,office,table}','public'),
  ('c0000000-0000-4000-8000-000000000007','Sofa (3-seat)','sofa-3-seat',2100,850,950,'catalog','box','{sofa,couch,furniture}','public'),
  ('c0000000-0000-4000-8000-000000000008','Bookshelf','bookshelf',800,1800,300,'catalog','box','{shelf,furniture,storage}','public'),
  ('c0000000-0000-4000-8000-000000000009','Queen Bed','queen-bed',1530,600,2030,'catalog','box','{bed,furniture,bedroom}','public'),
  ('c0000000-0000-4000-8000-000000000010','Nightstand','nightstand',450,550,400,'catalog','box','{furniture,bedroom,table}','public'),
  ('c0000000-0000-4000-8000-000000000011','Wardrobe','wardrobe',1000,2000,600,'catalog','box','{wardrobe,furniture,storage}','public'),
  ('c0000000-0000-4000-8000-000000000012','Floor Lamp','floor-lamp',350,1600,350,'catalog','cylinder','{lamp,light,furniture}','public'),
  ('c0000000-0000-4000-8000-000000000013','24" Monitor','monitor-24',555,410,190,'catalog','box','{monitor,screen,computer}','public'),
  ('c0000000-0000-4000-8000-000000000014','27" Monitor','monitor-27',625,450,200,'catalog','box','{monitor,screen,computer}','public'),
  ('c0000000-0000-4000-8000-000000000015','Laptop (15")','laptop-15',350,20,245,'catalog','box','{laptop,computer,electronics}','public'),
  ('c0000000-0000-4000-8000-000000000016','Desktop Tower','desktop-tower',200,450,450,'catalog','box','{pc,computer,electronics}','public'),
  ('c0000000-0000-4000-8000-000000000017','55" Television','tv-55',1240,780,260,'catalog','box','{tv,television,screen}','public'),
  ('c0000000-0000-4000-8000-000000000018','Smartphone','smartphone',72,147,8,'catalog','box','{phone,smartphone,mobile}','public'),
  ('c0000000-0000-4000-8000-000000000019','Tablet','tablet',180,250,7,'catalog','box','{tablet,ipad,electronics}','public'),
  ('c0000000-0000-4000-8000-000000000020','Keyboard','keyboard',440,35,135,'catalog','box','{keyboard,computer,peripheral}','public'),
  ('c0000000-0000-4000-8000-000000000021','Microwave Oven','microwave-oven',500,300,400,'catalog','box','{microwave,kitchen,appliance}','public'),
  ('c0000000-0000-4000-8000-000000000022','Refrigerator','refrigerator',700,1750,700,'catalog','box','{fridge,kitchen,appliance}','public'),
  ('c0000000-0000-4000-8000-000000000023','Washing Machine','washing-machine',600,850,600,'catalog','box','{washer,laundry,appliance}','public'),
  ('c0000000-0000-4000-8000-000000000024','Bicycle','bicycle',1750,1050,600,'catalog','box','{bike,bicycle,vehicle}','public'),
  ('c0000000-0000-4000-8000-000000000025','Motorcycle','motorcycle',2150,1150,800,'catalog','box','{motorcycle,motorbike,vehicle}','public'),
  ('c0000000-0000-4000-8000-000000000026','Sedan Car','sedan-car',4700,1450,1820,'catalog','box','{car,sedan,vehicle}','public'),
  ('c0000000-0000-4000-8000-000000000027','SUV','suv',4850,1720,1920,'catalog','box','{car,suv,vehicle}','public'),
  ('c0000000-0000-4000-8000-000000000028','City Bus','city-bus',12000,3200,2550,'catalog','box','{bus,vehicle,transit}','public'),
  ('c0000000-0000-4000-8000-000000000029','Kick Scooter','kick-scooter',1000,1050,160,'catalog','box','{scooter,vehicle}','public'),
  ('c0000000-0000-4000-8000-000000000030','Wristwatch','wristwatch',42,46,12,'catalog','box','{watch,wristwatch,accessory}','public'),
  ('c0000000-0000-4000-8000-000000000031','Coffee Mug','coffee-mug',95,95,80,'catalog','cylinder','{mug,cup,kitchen}','public'),
  ('c0000000-0000-4000-8000-000000000032','Soda Can','soda-can',66,123,66,'catalog','cylinder','{can,drink,beverage}','public'),
  ('c0000000-0000-4000-8000-000000000033','Wine Bottle','wine-bottle',75,300,75,'catalog','cylinder','{bottle,wine,drink}','public'),
  ('c0000000-0000-4000-8000-000000000034','Basketball','basketball',240,240,240,'catalog','sphere','{ball,basketball,sports}','public'),
  ('c0000000-0000-4000-8000-000000000035','Soccer Ball','soccer-ball',220,220,220,'catalog','sphere','{ball,soccer,sports}','public'),
  ('c0000000-0000-4000-8000-000000000036','Dinner Plate','dinner-plate',270,25,270,'catalog','cylinder','{plate,kitchen,dish}','public'),
  ('c0000000-0000-4000-8000-000000000037','Hardcover Book','hardcover-book',160,240,40,'catalog','box','{book,reading}','public'),
  ('c0000000-0000-4000-8000-000000000038','Backpack','backpack',320,460,200,'catalog','box','{backpack,bag}','public'),
  ('c0000000-0000-4000-8000-000000000039','Interior Door','interior-door',900,2030,40,'catalog','box','{door,home}','public'),
  ('c0000000-0000-4000-8000-000000000040','Traffic Cone','traffic-cone',300,750,300,'catalog','cone','{cone,traffic,outdoor}','public')
on conflict (id) do nothing;

-- 4. Attach real (CORS-enabled) GLB assets where a good model match exists. The
--    client uniform-scales each to its declared dimensions, so proportions hold.
--    (Khronos glTF-Sample-Assets = CC; three.js examples = verify license if commercial.)
update models set glb_url = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ChairDamaskPurplegold/glTF-Binary/ChairDamaskPurplegold.glb' where id = 'c0000000-0000-4000-8000-000000000001';
update models set glb_url = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb' where id = 'c0000000-0000-4000-8000-000000000002';
update models set glb_url = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb' where id = 'c0000000-0000-4000-8000-000000000007';
update models set glb_url = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CommercialRefrigerator/glTF-Binary/CommercialRefrigerator.glb' where id = 'c0000000-0000-4000-8000-000000000022';
update models set glb_url = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/CarbonFrameBike.glb' where id = 'c0000000-0000-4000-8000-000000000024';
update models set glb_url = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary/CarConcept.glb' where id = 'c0000000-0000-4000-8000-000000000026';
update models set glb_url = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ChronographWatch/glTF-Binary/ChronographWatch.glb', width_mm = 45, height_mm = 45, depth_mm = 14 where id = 'c0000000-0000-4000-8000-000000000030';
update models set glb_url = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/coffeeMug.glb', width_mm = 120, height_mm = 95, depth_mm = 95 where id = 'c0000000-0000-4000-8000-000000000031';
