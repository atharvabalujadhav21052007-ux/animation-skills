# NOT YOUR TYPE — Visual & Motion Animation Grammar

This document defines the physics, camera movements, frame rates, and visual accents that give NYT its signature snappy aesthetic.

---

## 1. Frame Rate Architecture

- **Characters:** Animate on **2s or 3s** (Effective 10–12 FPS). Do NOT use 30/60 FPS tweening on the character's limbs or mouth. Snappy pose holds give it the classic YouTube cut-out animator look.
- **Camera & Screen FX:** Render at **30 FPS**. Camera zooms, pans, Dutch angle tilts, and screen shakes must be completely fluid to contrast with the snappy characters.

---

## 2. Dynamic Camera Operations

| Camera Move | Parameters | Trigger |
|---|---|---|
| **Punch-In Zoom** | `1.0x` $\rightarrow$ `1.45x` or `1.75x` | Instant jump-cut on emphasis words or punchlines. |
| **Dutch Angle Tilt** | `-8°` to `+12°` | Used during bizarre situations or intense internal debates. |
| **Screen Shake** | $Intensity \times \sin(2\pi f t) \times e^{-k t}$ | Decaying 24Hz vibration on screams, Vine booms, or plate slams. |
| **Impact Flash** | Invert RGB or pure white for 1 frame | Triggered on the first frame of a climactic shock/scream. |

---

## 3. Studio Color Palette & Art Specs (Syncink / Meghna Karamkar Style)

| Element | Base Hex | Shadow / Contour Hex | Highlight / Accent Hex | Notes |
|---|---|---|---|---|
| **Character Skin (Wheatish)** | `#F5C5A3` | `#D49B74` | `#FFE2CF` | Warm peachy Indian skin tone; flat cel shadow. |
| **Ayug Hair** | `#1E1B22` | `#121115` | `#38353D` | Espresso charcoal black with sharp block sheen. |
| **Navy Teal Hoodie** | `#1E3A4B` | `#122430` | `#315B74` | Classic collegiate streetwear look. |
| **Mustard Yellow Hoodie** | `#E5A823` | `#B87B0F` | `#FFC84A` | Signature warm, vibrant Indian comedy tone. |
| **Mouth Cavity & Tongue** | `#7A1822` | `#501017` | `#E87070` (Tongue) | High-contrast theatrical mouth interior. |
| **Pani Puri Water (Teekha)** | `#366624` | `#234217` | `#609942` | Vibrant spicy mint/coriander emulsion. |
| **Pani Puri Water (Meetha)** | `#5C1D13` | `#3D120B` | `#822B1D` | Glossy tamarind-date chutney. |
| **Puffed Puri Shell** | `#E2A33B` | `#A86D1B` | `#F5C772` | Crispy golden semolina/flour crust. |
| **Desi Night Sky** | `#18192E` | `#0E0E1B` | `#2D1E40` | Urban twilight backdrop for high visual contrast. |
| **Sodium Streetlight Glow**| `#FFB326` | `#D98A0D` | `#FFF1B8` | Warm tungsten bulb light pool over cart. |

---

## 4. Character Anatomy & Viseme Mapping

The character rig is partitioned into modular layers:
```
Composite Stack (Back to Front):
1. Background Plate (Street food cart, classroom)
2. Character Hair Back
3. Character Base Body (Hoodie & Torso)
4. Character Head Base & Ears
5. Character Eyebrows & Eyes (Neutral, Shock, Rage, Squint, Smug)
6. Character Mouth Visemes (Rest, A, E, O, U, Scream, Smirk)
7. Character Hair Front (With 1-frame secondary motion lag)
8. Visual FX Overlays (Sweat drop, Anger vein, Speed lines)
```

### Lip-Sync Viseme Set:
- **`rest`:** Closed mouth / silence.
- **`a`:** Open vertical oval, upper teeth bar and pink tongue visible.
- **`e`:** Horizontal toothy grimace (vowels ee/eh, consonants s/t/d).
- **`o`:** Round open mouth.
- **`u`:** Small tight circle mouth.
- **`scream`:** Giant extended jaw with jagged teeth and vibrating tongue.
- **`smirk`:** Asymmetric sly grin.

