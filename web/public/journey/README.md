# The journey's maps

Public data, credited on the About page (docs/about.md, "The journey on the home page"). Each was
reprojected to equirectangular, north up, longitude -180 at the left edge, and checked for seams.

- `earth-day.jpg`, `earth-clouds.jpg`, `earth-night.jpg`: NASA Blue Marble NG (July 2004, topography
  and bathymetry), The Blue Marble clouds, Black Marble 2016. 2048 x 1024.
- `moon.jpg`: NASA SVS 4720, LROC colour. 1024 x 512.
- `mercury.jpg`: MESSENGER MDIS global basemap (USGS Astrogeology), monochrome. 2048 x 1024.
- `ceres.jpg`: Dawn FC2 HAMO mosaic (NASA PDS), turned so 0 E is centred; unlit polar gaps filled grey.
- `venus-height.png`: Magellan global topography (USGS Astrogeology), 1024 x 512, equalised: each grey
  level covers the same share of Venus's area, so the scene can fill seas to the model's shares
  smoothly. Heights run -1,957 m to +11,002 m; 7.6% of pixels had no measurement and were filled
  from their neighbours.
- `stars.jpg`: NASA SVS 4851 star map (Gaia DR2), 2048 x 1024, mirrored so right ascension increases
  to the right; drawn only for the Milky Way's light, from a coarse mip.
