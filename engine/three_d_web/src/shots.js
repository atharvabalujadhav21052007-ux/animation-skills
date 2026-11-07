import * as THREE from 'three';
import { makeHuman } from './human.js';
import {
  makeMoon,
  makeMoonDebris,
  makeOceanShelf,
  makeWobblingEarth,
  makeTideGaugeHUD,
  makeAxisProtractorHUD,
  makeSpeedometerHUD,
  makeNocturnalEyes,
  sparks
} from './props.js';
import { cam, place, shake, easeOut, easeIn, easeInOut, lerp, clamp } from './anim.js';

export const DURATION = 39.985;

// Kinetic gold subtitles
export const CAPTIONS = [
  [0.40, "<span class=\"hl\">WHAT</span> IF THE"],
  [1.82, "<span class=\"hl\">MOON</span> SUDDENLY"],
  [3.34, "<span class=\"hl\">VANISHED</span> INTO THIN AIR"],
  [5.91, "<span class=\"hl\">TONIGHT?</span>"],

  [7.02, "<span class=\"hl\">INSTANTLY,</span> OCEAN TIDES"],
  [8.60, "<span class=\"hl\">WOULD</span> WEAKEN BY"],
  [10.11, "<span class=\"hl\">SIXTY</span> PERCENT,"],
  [11.75, "<span class=\"hl\">CAUSING</span> MARINE LIFE"],
  [13.34, "<span class=\"hl\">UTTER CHAOS!</span>"],

  [14.08, "<span class=\"hl\">WITHOUT</span> THE MOON'S"],
  [16.31, "<span class=\"hl\">GRAVITATIONAL</span> ANCHOR,"],
  [18.76, "<span class=\"hl\">EARTH'S AXIS</span> WOULD START"],
  [21.73, "<span class=\"hl\">VIOLENTLY</span> WOBBLING!"],

  [24.22, "<span class=\"hl\">DAYS</span> WOULD SHRINK"],
  [25.80, "<span class=\"hl\">TO JUST SIX</span> TO TWELVE HOURS"],
  [27.40, "<span class=\"hl\">AS EARTH SPINS</span> MUCH FASTER."],

  [28.92, "<span class=\"hl\">NIGHTS</span> WOULD BECOME"],
  [31.22, "<span class=\"hl\">PITCH BLACK,</span> LEAVING"],
  [33.52, "<span class=\"hl\">NOCTURNAL</span> ANIMALS"],
  [35.53, "<span class=\"hl\">COMPLETELY</span> DISORIENTED"],
  [38.03, "<span class=\"hl\">FOREVER!</span>"]
];

export const FADES = [
  [6.88, 7.02, 7.02, 7.14],
  [13.92, 14.08, 14.08, 14.20],
  [24.06, 24.22, 24.22, 24.36],
  [28.76, 28.92, 28.92, 29.08],
  [38.85, 39.75, 39.985, 40.00]
];

// =========================================================================
// SHOT 1: THE VANISHING HOOK (0.00s - 7.02s)
// Boy pointing at full 3D Moon in night sky, Moon explodes, boy gasps in shock!
// =========================================================================
function shot1({ makeStage }) {
  const scene = makeStage({ sunDir: [2.0, 3.0, 4.0], sun: 2.2 });
  const c = cam(36);

  // 1. Hero 3D Character
  const man = makeHuman('casual', { shirtColor: 'blue' });
  man.root.position.set(-0.12, 0, 0.1);
  scene.add(man.root);

  // 2. 3D Moon floating in upper right sky
  const moon = makeMoon({ radius: 0.24 });
  moon.root.position.set(0.24, 1.55, -0.25);
  scene.add(moon.root);

  // 3. Moon Explosion Debris
  const debris = makeMoonDebris({ count: 120, radius: 0.24 });
  debris.root.position.set(0.24, 1.55, -0.25);
  debris.explode(0);
  scene.add(debris.root);

  return {
    scene,
    camera: c,
    update(lt, gt) {
      man.idle(lt);
      man.blink(lt);

      if (gt < 3.34) {
        // Pointing up at Moon with left arm
        man.speak(lt, 0.9);
        man.setBrow(0.4);
        man.setPose({
          head: [-0.22, -0.32, 0],
          chest: [0.03, -0.08, 0],
          lSh: [-0.85, 0, 0.70],
          lEl: [-0.45, 0, 0],
          rSh: [0, 0, -0.18],
          rEl: [-0.25, 0, 0]
        });

        moon.mesh.rotation.y = lt * 0.15;
        moon.root.visible = true;
        debris.explode(0);

        // Smooth cinematic framing
        const camZ = lerp(3.30, 2.95, lt / 3.34);
        place(c, [0.02, 1.20, camZ], [0.05, 1.15, 0]);
        return { bloom: 0.3, exposure: 1.05 };
      } else {
        // Moon vanishes at 3.34s!
        const expTime = gt - 3.34;
        const expProg = clamp(expTime / 2.5, 0, 1);

        const moonScale = Math.max(0, 1.0 - easeOut(expTime / 0.25));
        moon.root.scale.setScalar(moonScale);
        if (moonScale <= 0.01) moon.root.visible = false;
        debris.explode(expProg);

        // Boy in shock with hands up to cheeks!
        man.speak(lt, 0.2);
        man.setMouth(0.95);
        man.setBrow(1.0);
        man.setPose({
          head: [0.05, 0, 0],
          chest: [-0.04, 0, 0],
          lSh: [-1.15, 0.1, 0.35],
          lEl: [-1.75, 0, 0],
          rSh: [-1.15, -0.1, -0.35],
          rEl: [-1.75, 0, 0]
        });

        // Snap punch-in
        const shk = shake(lt, 1.2 * (1.0 - expProg), 4);
        const camZ = lerp(2.95, 2.55, expProg);
        place(c, [-0.04 + shk[0], 1.24 + shk[1], camZ], [-0.08, 1.20, 0]);

        const bloomPulse = expTime < 0.25 ? 1.8 * (1.0 - expTime / 0.25) : 0.35;
        return { bloom: bloomPulse, exposure: 1.1 };
      }
    }
  };
}

// =========================================================================
// SHOT 2: OCEAN TIDES COLLAPSE (7.02s - 14.08s)
// Boy in orange on coastline watching water recede, live -60% tide gauge
// =========================================================================
function shot2({ makeStage }) {
  const scene = makeStage({ sunDir: [1.5, 2.5, 3.5], sun: 2.0 });
  const c = cam(36);

  // 1. Hero Character in orange
  const man = makeHuman('casual', { shirtColor: 'orange' });
  man.root.position.set(-0.14, 0, 0.15);
  scene.add(man.root);

  // 2. Receding Ocean Coastline
  const ocean = makeOceanShelf();
  ocean.root.position.set(0.1, -0.05, -0.6);
  scene.add(ocean.root);

  // 3. Holographic Pacific Tide Gauge (-60%)
  const gauge = makeTideGaugeHUD();
  gauge.root.position.set(0.24, 1.22, 0.0);
  scene.add(gauge.root);

  return {
    scene,
    camera: c,
    update(lt, gt) {
      const u = lt / 7.06;
      man.idle(lt);
      man.blink(lt);
      man.speak(lt, 0.85);

      // Water drains away
      ocean.setTideLevel(lerp(1.0, 0.4, easeOut(u)));
      ocean.updateFish(lt);
      gauge.setPercent(lerp(100, 40, easeOut(u)));

      // Panicked boy gesturing at dry sea floor
      man.setBrow(0.8);
      man.setPose({
        head: [0.12, -0.25, 0],
        chest: [0.05, -0.08, 0],
        lSh: [-0.70, 0, 0.45],
        lEl: [-0.50, 0, 0],
        rSh: [0, 0, -0.40],
        rEl: [-0.60, 0, 0]
      });

      // Camera push-in
      const camZ = lerp(3.25, 2.80, u);
      const shk = shake(lt, 0.35, 1);
      place(c, [shk[0], 1.20 + shk[1], camZ], [0.05, 1.15, 0]);

      return { bloom: 0.35, exposure: 1.05 };
    }
  };
}

// =========================================================================
// SHOT 3: EARTH AXIS VIOLENTLY WOBBLING (14.08s - 24.22s)
// 3D Earth globe tilting wildly, live protractor, boy stumbling sideways
// =========================================================================
function shot3({ makeStage }) {
  const scene = makeStage({ sunDir: [2.5, 2.0, 3.5], sun: 2.2 });
  const c = cam(36);

  // 1. Hero Character in green shirt
  const man = makeHuman('casual', { shirtColor: 'green' });
  man.root.position.set(-0.16, 0, 0.15);
  scene.add(man.root);

  // 2. Wobbling 3D Earth Globe
  const earth = makeWobblingEarth({ radius: 0.32 });
  earth.root.position.set(0.22, 1.35, -0.1);
  scene.add(earth.root);

  // 3. Live Axis Tilt Protractor HUD
  const protractor = makeAxisProtractorHUD();
  protractor.root.position.set(0.22, 0.76, 0.1);
  scene.add(protractor.root);

  return {
    scene,
    camera: c,
    update(lt, gt) {
      const u = lt / 10.14;
      man.idle(lt);
      man.blink(lt);
      man.speak(lt, 0.9);

      // Violent wobbling tilt
      const wobbleAngle = 23.5 + Math.sin(lt * 2.8) * 18.0;
      earth.setWobble(lt, wobbleAngle * Math.PI / 180, Math.sin(lt * 2.2) * 0.15, 1.2);
      protractor.setAngle(wobbleAngle);

      // Boy stumbling sideways
      const stumble = Math.sin(lt * 2.8) * 0.10;
      man.root.position.x = -0.16 + stumble;
      man.setBrow(0.9);
      man.setPose({
        head: [0.04, stumble * 0.6, -stumble * 0.4],
        chest: [0, 0, -stumble * 0.5],
        lSh: [0, 0, 0.75 + stumble * 2.0],
        lEl: [-0.40, 0, 0],
        rSh: [0, 0, -0.75 - stumble * 2.0],
        rEl: [-0.40, 0, 0]
      });

      // Camera tracking
      const camZ = lerp(3.30, 2.85, u);
      const shk = shake(lt, 0.5, 1);
      c.rotation.z = -stumble * 0.05;
      place(c, [shk[0], 1.22 + shk[1], camZ], [0.03, 1.16, 0]);

      return { bloom: 0.35, exposure: 1.05 };
    }
  };
}

// =========================================================================
// SHOT 4: SUPERSONIC EQUATOR ROTATION (24.22s - 28.92s)
// Stroboscopic fast day/night cycles, spinning clock, dizzy boy clutching head
// =========================================================================
function shot4({ makeStage }) {
  const scene = makeStage({ sunDir: [3.0, 3.0, 3.0], sun: 2.5 });
  const c = cam(36);

  // 1. Hero Character centered
  const man = makeHuman('casual', { shirtColor: 'blue' });
  man.root.position.set(-0.12, 0, 0.15);
  scene.add(man.root);

  // 2. Circular 24-Hour Speedometer Clock
  const speedo = makeSpeedometerHUD();
  speedo.root.position.set(0.24, 1.35, 0.0);
  scene.add(speedo.root);

  return {
    scene,
    camera: c,
    update(lt, gt) {
      const u = lt / 4.70;
      man.blink(lt);
      man.speak(lt, 0.8);

      const currentHours = lerp(24, 6, easeOut(u));
      speedo.setHours(currentHours);

      // Strobe day/night
      const strobe = Math.sin(lt * 14.0) * 0.5 + 0.5;
      scene.userData.sky.material.uniforms.top.value.setRGB(
        lerp(0.04, 0.35, strobe),
        lerp(0.08, 0.55, strobe),
        lerp(0.18, 0.85, strobe)
      );

      // Dizzy boy clutching head
      man.setBrow(0.85);
      man.setPose({
        head: [Math.sin(lt * 7) * 0.12, Math.cos(lt * 7) * 0.12, Math.sin(lt * 5) * 0.08],
        chest: [-0.06, 0, 0],
        lSh: [-1.30, 0.20, 0.40],
        lEl: [-1.95, 0, 0],
        rSh: [-1.30, -0.20, -0.40],
        rEl: [-1.95, 0, 0]
      });

      const camZ = lerp(3.10, 2.65, easeOut(u));
      const shk = shake(lt, 0.7, 2);
      place(c, [-0.02 + shk[0], 1.22 + shk[1], camZ], [0.0, 1.18, 0]);

      return { bloom: 0.4 + strobe * 0.2, exposure: 1.05 + strobe * 0.15 };
    }
  };
}

// =========================================================================
// SHOT 5: THE NOCTURNAL VOID (28.92s - 40.00s)
// Pitch black dark, boy holding glowing 3D flashlight, predator eyes glowing
// =========================================================================
function shot5({ makeStage }) {
  const scene = makeStage({ sunDir: [0, -1, 0], sun: 0.2 });
  const c = cam(36);

  // 1. Hero Character in dark pants
  const man = makeHuman('casual', { shirtColor: 'blue', pantsColor: 'dark' });
  man.root.position.set(-0.12, 0, 0.15);
  scene.add(man.root);

  // 2. Glowing 3D Flashlight Spotlight
  const flashLight = new THREE.SpotLight(0xfff5dd, 4.5, 8.0, Math.PI * 0.22, 0.45, 1.2);
  flashLight.position.set(-0.12, 1.15, 0.4);
  scene.add(flashLight);
  const flashTarget = new THREE.Object3D();
  flashTarget.position.set(0.25, 1.2, -1.5);
  scene.add(flashTarget);
  flashLight.target = flashTarget;

  // 3. Glowing cartoon predator eyes in darkness
  const eyes = makeNocturnalEyes();
  eyes.root.position.set(0.25, 1.30, -1.2);
  scene.add(eyes.root);

  return {
    scene,
    camera: c,
    update(lt, gt) {
      const u = lt / 11.08;
      man.idle(lt);
      man.blink(lt);
      man.speak(lt, 0.85);

      // Shivering boy pointing flashlight into darkness
      const shiver = Math.sin(lt * 25.0) * 0.02;
      man.setBrow(0.9);
      man.setPose({
        head: [0.06, 0.15 + shiver * 1.5, 0],
        chest: [-0.04, 0.06, 0],
        lSh: [-0.40, 0, 0.20],
        lEl: [-1.40, 0, 0],
        rSh: [-1.15 + shiver * 2.0, 0, -0.15],
        rEl: [-0.30, 0, 0]
      });

      // Eyes blink and contract
      const eyeBlink = Math.sin(lt * 3.0) > 0.95;
      eyes.update(lt, eyeBlink, new THREE.Vector2(Math.sin(lt * 2.0), Math.cos(lt * 1.5)), 1.0 + Math.sin(lt * 4.0) * 0.3, 2.5, 0.9);

      // Slow cinematic camera push-in
      const camZ = lerp(3.20, 2.75, u);
      place(c, [-0.02, 1.22, camZ], [0.04, 1.18, 0]);

      return { bloom: 0.45, exposure: 1.0 };
    }
  };
}

export const SHOTS = [
  { start: 0.00,  end: 7.02,  build: shot1 },
  { start: 7.02,  end: 14.08, build: shot2 },
  { start: 14.08, end: 24.22, build: shot3 },
  { start: 24.22, end: 28.92, build: shot4 },
  { start: 28.92, end: 40.00, build: shot5 }
];
