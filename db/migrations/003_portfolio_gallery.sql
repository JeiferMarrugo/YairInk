-- Galería de imágenes por pieza de portafolio

ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE portfolio_items
SET images = jsonb_build_array(
  jsonb_build_object('src', src, 'alt', alt)
)
WHERE jsonb_array_length(images) = 0;

-- Galerías demo en piezas con varias fotos
UPDATE portfolio_items
SET images = '[
  {"src":"/images/portfolio/hero-floral.jpg","alt":"Tatuaje floral de línea fina en brazo"},
  {"src":"/images/portfolio/botanical-forearm.jpg","alt":"Detalle botánico en antebrazo"}
]'::jsonb
WHERE title = 'Estudio Botánico No. 14';

UPDATE portfolio_items
SET images = '[
  {"src":"/images/portfolio/geometric-shoulder.jpg","alt":"Tatuaje geométrico en hombro"},
  {"src":"/images/portfolio/mandala-back.jpg","alt":"Vista posterior del blackwork geométrico"}
]'::jsonb
WHERE title = 'Forma Arquitectónica';

UPDATE portfolio_items
SET images = '[
  {"src":"/images/portfolio/mandala-back.jpg","alt":"Tatuaje celestial en torso"},
  {"src":"/images/portfolio/geometric-shoulder.jpg","alt":"Detalle de línea fina en hombro"},
  {"src":"/images/portfolio/hero-floral.jpg","alt":"Composición floral complementaria"}
]'::jsonb
WHERE title = 'Atlas Celestial';

UPDATE portfolio_items
SET images = '[
  {"src":"/images/portfolio/anatomical-heart.jpg","alt":"Tatuaje de corazón anatómico"},
  {"src":"/images/portfolio/micro-realism-eye.jpg","alt":"Detalle micro-realismo"}
]'::jsonb
WHERE title = 'Estudio Anatómico II';
