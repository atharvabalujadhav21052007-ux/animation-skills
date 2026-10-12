import * as THREE from 'three';
import { steelTextures, woodTexture, fabricTexture, skinTexture } from './textures.js';

let M = null;
export function materials() {
  if (M) return M;
  const steel = steelTextures(3);
  const steel2 = steelTextures(9);

  M = {
    // Stylized Character Materials (Pixar / Zack D Style)
    skin: new THREE.MeshPhysicalMaterial({
      color: 0xe8ac8b,
      roughness: 0.35,
      sheen: 0.3,
      sheenColor: new THREE.Color(0xffd5c0),
      clearcoat: 0.15,
      clearcoatRoughness: 0.25
    }),
    lip: new THREE.MeshStandardMaterial({ color: 0xcc685a, roughness: 0.4 }),
    hair: new THREE.MeshStandardMaterial({ color: 0x281912, roughness: 0.55 }),
    eyeWhite: new THREE.MeshPhysicalMaterial({ color: 0xfefefe, roughness: 0.05, clearcoat: 1.0 }),
    iris: new THREE.MeshPhysicalMaterial({ color: 0x542e16, roughness: 0.1, clearcoat: 1.0 }),
    mouth: new THREE.MeshStandardMaterial({ color: 0x180606, roughness: 0.9 }),
    teeth: new THREE.MeshStandardMaterial({ color: 0xf8f8f8, roughness: 0.25 }),

    // Outfits & Colors
    shirtBlue: new THREE.MeshStandardMaterial({ color: 0x1d62eb, roughness: 0.55 }),
    shirtOrange: new THREE.MeshStandardMaterial({ color: 0xee621b, roughness: 0.55 }),
    shirtGreen: new THREE.MeshStandardMaterial({ color: 0x16a755, roughness: 0.55 }),
    pantsGrey: new THREE.MeshStandardMaterial({ color: 0x252e3d, roughness: 0.65 }),
    pantsDark: new THREE.MeshStandardMaterial({ color: 0x161d28, roughness: 0.7 }),
    sneakerWhite: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, clearcoat: 0.5 }),
    sneakerSole: new THREE.MeshStandardMaterial({ color: 0x9ca9b8, roughness: 0.6 }),

    // Holographic X-Ray Scifi Materials (Style Sheet Box 3)
    xrayHolo: new THREE.MeshPhysicalMaterial({
      color: 0x00d4ff,
      emissive: 0x0090bf,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.32,
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 0.9,
      depthWrite: false
    }),
    xrayBone: new THREE.MeshBasicMaterial({ color: 0x00ffff }),
    goldGlow: new THREE.MeshBasicMaterial({ color: 0xffaa00 }),

    // Props & Environment
    cloth: new THREE.MeshStandardMaterial({ color: 0x20242e, roughness: 0.8 }),
    wood: new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.75 }),
    steel: new THREE.MeshPhysicalMaterial({ color: 0xc4c6ca, map: steel.color, metalness: 0.9, roughness: 0.35, clearcoat: 0.3 }),
    steelDark: new THREE.MeshPhysicalMaterial({ color: 0x3a3e48, map: steel2.color, metalness: 0.8, roughness: 0.3 })
  };
  return M;
}
