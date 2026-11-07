import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SHOTS, CAPTIONS, DURATION, FADES } from './shots.js';
import { lerp } from './anim.js';

// Native 1080x1920 9:16 vertical resolution
const W = 1080, H = 1920;
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').prepend(renderer.domElement);

// ---------- shared environment (cool blue/navy studio backdrop) ----------
const SKY_FRAG = `
  uniform vec3 top, mid, horizon, floorC; varying vec3 vDir;
  void main(){
    vec3 d = normalize(vDir);
    float y = d.y;
    vec3 c = y > 0.0 ? mix(mix(horizon, mid, smoothstep(0.0,0.18,y)), top, smoothstep(0.15,0.85,y))
                     : mix(horizon, floorC, smoothstep(0.0,-0.12,y));
    gl_FragColor = vec4(c,1.0);
    #include <colorspace_fragment>
  }`;

export function skyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      top: { value: new THREE.Color(0x040814) },
      mid: { value: new THREE.Color(0x0b1324) },
      horizon: { value: new THREE.Color(0x142036) },
      floorC: { value: new THREE.Color(0x060b17) },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = (modelMatrix*vec4(position,1.)).xyz - cameraPosition; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position.z = gl_Position.w; }`,
    fragmentShader: SKY_FRAG,
    side: THREE.BackSide,
    depthWrite: false,
    toneMapped: false,
  });
}

const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene();
{
  const s = new THREE.Mesh(new THREE.SphereGeometry(20, 64, 32), skyMaterial());
  s.material.toneMapped = true;
  envScene.add(s);
  const u = s.material.uniforms;
  u.top.value.set(0x081020);
  u.mid.value.set(0x0f1d30);
  u.horizon.value.set(0x182844);
  u.floorC.value.set(0x070d1a);

  const panel = (w, h, pos, inten) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(inten, inten, inten), side: THREE.DoubleSide })
    );
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    envScene.add(m);
  };
  panel(8, 4, [-6, 8, 6], 2.8);   // key softbox
  panel(4, 10, [9, 3, -2], 2.0); // rim strip
  panel(10, 3, [0, 4, -9], 1.2);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ color: 0x09111e }));
  fl.rotation.x = -Math.PI / 2;
  fl.position.y = -1.2;
  envScene.add(fl);
}
const envTex = pmrem.fromScene(envScene, 0.02).texture;

export function makeStage({ shadowSize = 3.5, sunDir = [1.5, 2.5, 3.5], sun = 2.4 } = {}) {
  const scene = new THREE.Scene();
  scene.environment = envTex;
  scene.environmentIntensity = 0.95;

  const sky = new THREE.Mesh(new THREE.SphereGeometry(80, 48, 24), skyMaterial());
  sky.frustumCulled = false;
  sky.renderOrder = -10;
  scene.add(sky);
  scene.userData.sky = sky;

  // Sleek reflective dark studio floor
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x060b17, roughness: 0.45, metalness: 0.1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // 1. Ambient hemisphere light
  const hemi = new THREE.HemisphereLight(0x7da4d4, 0x0e1726, 1.25);
  scene.add(hemi);

  // 2. Warm Key Light
  const key = new THREE.DirectionalLight(0xfff6ee, sun);
  key.position.set(...sunDir);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const c = key.shadow.camera;
  c.left = c.bottom = -shadowSize;
  c.right = c.top = shadowSize;
  c.near = 0.5;
  c.far = 30;
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 2;
  scene.add(key, key.target);

  // 3. Soft Cool Fill Light
  const fill = new THREE.DirectionalLight(0x6085b0, 1.3);
  fill.position.set(-2.5, 1.5, 2.5);
  scene.add(fill);

  // 4. Electric Cyan Rim Light
  const rim = new THREE.DirectionalLight(0x00f0ff, 2.2);
  rim.position.set(3.0, 2.5, -2.8);
  scene.add(rim);

  scene.userData.key = key;
  return scene;
}

// ---------- post processing ----------
const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const composer = new EffectComposer(renderer, rt);
const dummyScene = new THREE.Scene(), dummyCam = new THREE.PerspectiveCamera();
const renderPass = new RenderPass(dummyScene, dummyCam);
const bokeh = new BokehPass(dummyScene, dummyCam, { focus: 2, aperture: 0.001, maxblur: 0.005 });
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.32, 0.45, 1.3);
const grade = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVig: { value: 0.22 }
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uVig; varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 q = vUv - 0.5;
      q.x *= 0.5625;
      float d = length(q);
      c.rgb *= 1.0 - uVig * smoothstep(0.18, 0.65, d);
      gl_FragColor = c;
    }`,
});
composer.addPass(renderPass);
composer.addPass(bokeh);
composer.addPass(bloom);
composer.addPass(new OutputPass());
composer.addPass(grade);

// ---------- timeline ----------
const capEl = document.getElementById('cap');
const fadeEl = document.getElementById('fade');
const hud = document.getElementById('hud');
const built = new Map();

function getShot(i) {
  if (!built.has(i)) built.set(i, SHOTS[i].build({ makeStage, W, H }));
  return built.get(i);
}

window.DURATION = DURATION;
window.RENDER_READY = false;

window.renderAt = (t) => {
  let idx = SHOTS.findIndex(s => t >= s.start && t < s.end);
  if (idx < 0) idx = SHOTS.length - 1;
  const def = SHOTS[idx];
  const shot = getShot(idx);
  const lt = t - def.start;
  const r = shot.update(lt, t) || {};
  const cam = shot.camera;

  cam.aspect = W / H;
  cam.updateProjectionMatrix();
  if (shot.scene.userData.sky) {
    shot.scene.userData.sky.position.copy(cam.position);
  }

  renderPass.scene = bokeh.scene = shot.scene;
  renderPass.camera = bokeh.camera = cam;

  const dof = r.dof || { focus: 3, aperture: 0, maxblur: 0 };
  bokeh.enabled = dof.aperture > 0;
  bokeh.uniforms.focus.value = dof.focus;
  bokeh.uniforms.aperture.value = dof.aperture;
  bokeh.uniforms.maxblur.value = dof.maxblur ?? 0.012;
  bokeh.uniforms.nearClip.value = cam.near;
  bokeh.uniforms.farClip.value = cam.far;

  bloom.strength = (r.bloom ?? 0.35) * 0.75;
  renderer.toneMappingExposure = r.exposure ?? 1.05;

  // Dynamic vignette (deeper in shot 5 nocturnal void)
  grade.uniforms.uTime.value = t;
  grade.uniforms.uVig.value = t >= 28.92 ? lerp(0.35, 0.88, Math.min(1.0, (t - 28.92) / 8.0)) : 0.22;

  composer.render();

  // Subtitles: Curated captions with active gold highlight from words.js
  const c = CAPTIONS.filter(c => t >= c[0]).pop();
  capEl.innerHTML = c && (c[2] == null || t < c[2]) ? c[1] : '';

  // Fades
  let f = 0;
  for (const [a, b, c2, d] of FADES) {
    if (t >= a && t < d) {
      f = Math.max(f, t < b ? (t - a) / (b - a) : t < c2 ? 1 : (d - t) / (d - c2));
    }
  }
  fadeEl.style.opacity = f;
  hud.textContent = `t=${t.toFixed(2)}s shot ${idx + 1}/5 (1080x1920)`;
  return idx;
};

// Ready promise & interactive preview
const qs = new URLSearchParams(location.search);
window.ready = document.fonts.ready.then(() => {
  window.RENDER_READY = true;
  return true;
});

if (qs.has('t')) {
  window.ready.then(() => window.renderAt(parseFloat(qs.get('t'))));
} else if (!qs.has('render')) {
  let t0 = null;
  const loop = () => {
    const t = t0 ? ((performance.now() - t0) / 1000) % DURATION : 0;
    window.renderAt(t);
    requestAnimationFrame(loop);
  };
  window.ready.then(() => {
    t0 = performance.now();
    loop();
  });
}
