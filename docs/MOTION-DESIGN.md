# Asel motion direction

Reference: https://www.thoughtlab.com/ — oversized type, sculptural hero and scroll-led movement, adapted to fragrance photography and Asel branding.

Palette: near-black #11110f, warm white #f8f5ee, gold #d4b37a, bronze #96733e, muted stone #bcb7ad. Existing theme tokens remain in use outside the cinematic hero.

Typography: heavy Arial/Helvetica display, 52–112px desktop hero, 42–64px mobile; existing readable body and product typography. Arabic uses natural shaping and normal tracking. Retain existing translations.

Layout: compact sticky navigation → full-width dark perfume scene with large start-aligned title and actual Libre cutout → brand ribbon → existing shopping sections. Hero artwork sits opposite the copy, below it on narrow screens. Strong sans-serif section headings connect the store to the reference.

Motion: staggered entrance for the hero copy and artwork; the gold halo slowly morphs while visible. Hero bottle and halo respond from the first native scroll. Editorial artwork, headings, categories, notes, and product cards move into place and become opaque according to their viewport position, reversing when scrolling back upwards. Streamed and newly filtered content is registered through a child-list observer. No scroll hijacking, new animation dependencies, or motion in checkout. Reduced-motion preferences disable all effects and leave content visible. Animation observers and browser animations are cleaned up on navigation or preference changes.

Review: a generic agency blob would obscure the store's purpose. Use the existing perfume photograph inside a gold glass-like halo instead. Keep product grids and transactional controls familiar; concentrate the visual change in the hero and editorial sections.
