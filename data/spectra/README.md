# Spectra

Measured sunlight and absorption cross-sections, as published. `node tools/spectra.ts` bins them into
`calc/src/spectra.ts`, which the ozone model (`calc/src/model/ozone.ts`) reads; `--check` fails when that
file is stale. All four files come from NCAR's TUV-x photolysis model
([github.com/NCAR/TUV-x](https://github.com/NCAR/TUV-x), `test/data/old_tuv/DATAE1/`), unchanged.

| File | What | Original source |
| --- | --- | --- |
| `2006JPL_O3.txt` | O₃ absorption cross-sections, 185 to 828 nm, at 293 to 298 K and 218 K, in 10⁻²⁰ cm² | JPL Publication 06-2 (Sander et al. 2006) |
| `O2_yoshino.abs` | O₂ absorption cross-sections in the Herzberg continuum, 205 to 240 nm, in 10⁻²⁴ cm² | Yoshino et al. (1988), Planetary and Space Science 36, 1469 |
| `atlas3_1994_317_a.dat` | Sunlight at 1 AU, 150 to 408 nm, in mW m⁻² nm⁻¹ | ATLAS-3 SUSIM, 13 November 1994 |
| `neckel.flx` | Sunlight at 1 AU, 330 to 1,250 nm, in photons cm⁻² s⁻¹ nm⁻¹ | Neckel and Labs (1984), Solar Physics 90, 205 |
