const StructGridSize = `struct GridSize { dim: vec2f, dye: vec2f, rdx : f32, dyeRdx : f32, boundaryMin: vec2f, boundaryMax: vec2f }

fn inside(p : vec2f, min : vec2f, max : vec2f) -> bool { return p.x >= min.x && p.y >= min.y && p.x <= max.x && p.y <= max.y; }
fn insideBoundary(p : vec2f, gridSize: GridSize) -> bool { return inside(p, gridSize.boundaryMin, gridSize.boundaryMax); }`

const StructMouse = `struct Mouse { pos: vec2f, vel: vec2f }`

const createIdFunction = (w: string) => `fn ID(p : vec2f) -> u32 { return u32(p.x + p.y * ${w}); }`
const IdGrid = createIdFunction('grid.dim.x')
const IdDye = createIdFunction('grid.dye.x')

// Initialize the pos and index variables and target the cells in the given grid
const createMain = (id: string, w: [string, string], h: [string, string]) => `
${id}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  var pos = vec2f(global_id.xy);
  if (!inside(pos, vec2f(${w[0]}, ${h[0]}), vec2f(${w[1]}, ${h[1]}))) { return; }
  if (insideBoundary(pos, grid)) { return; }

  let index = ID(pos);`

const MainDye = createMain(IdDye, ['0', 'grid.dye.x - 1'], ['0', 'grid.dye.y - 1'])
const MainInterior = createMain(IdGrid, ['0', 'grid.dim.x - 1'], ['0', 'grid.dim.y - 1'])
const MainFull = createMain(IdGrid, ['-1', 'grid.dim.x'], ['-1', 'grid.dim.y'])

const DeclareSideNeighbors = (p: string) => `
  let L = ${p} - vec2f(1, 0);
  let R = ${p} + vec2f(1, 0);
  let B = ${p} - vec2f(0, 1);
  let T = ${p} + vec2f(0, 1);`

const DeclareBilerped = (p: string, dim: string, get: string) => `
  p = clamp(p, vec2(0), ${dim} - 1);
  let p1 = floor(${p});
  let TL = p1 + vec2(0, 1);
  let TR = p1 + 1;
  let BL = p1;
  let BR = p1 + vec2(1, 0);

  let m = fract(p);
  let bilerped = mix(mix(${get}(BL), ${get}(BR), m.x), mix(${get}(TL), ${get}(TR), m.x), m.y);
`

const createBindings = (...bindings: Array<[string, string, string, boolean?]>) =>
  bindings
    .map(([type, name, dataType, readWrite], index) => {
      const accessMode = type === 'uniform' ? '' : readWrite ? 'read_write' : 'read'
      return `@group(0) @binding(${index}) var<${type}${accessMode ? `, ${accessMode}` : ''}> ${name} : ${dataType};`
    })
    .join('\n')

const updateVelocity = `
${StructGridSize}
${StructMouse}

${createBindings(
  ['storage', 'v_in', 'array<vec2f>'],
  ['storage', 'v_out', 'array<vec2f>', true],
  ['uniform', 'grid', 'GridSize'],
  ['uniform', 'uMouse', 'Mouse'],
  ['uniform', 'uForce', 'f32'],
  ['uniform', 'uRadius', 'f32'],
  ['uniform', 'uDiffusion', 'f32'],
  ['uniform', 'uDt', 'f32'],
)}

fn createSplat(pos : vec2f, splatPos : vec2f, vel : vec2f, radius : f32) -> vec2f {
  var p = pos - splatPos;
  p.x *= grid.dim.x / grid.dim.y;
  var v = vel;
  v.x *= grid.dim.x / grid.dim.y;
  return exp(-dot(p, p) / radius) * v;
}

${MainInterior}
  if (insideBoundary(pos, grid)) { return; }

  let shouldSplat = !insideBoundary(uMouse.pos * grid.dim, grid);
  var splat = vec2f(0);
  if (shouldSplat) { splat = createSplat(pos / grid.dim, uMouse.pos, 2*uMouse.vel, uRadius) * 200*uForce*uDt; }
  v_out[index] = v_in[index] * uDiffusion + splat;
}`

const updateDye = `
${StructGridSize}
${StructMouse}

${createBindings(
  ['storage', 'dye_in', 'array<vec4f>'],
  ['storage', 'dye_out', 'array<vec4f>', true],
  ['uniform', 'grid', 'GridSize'],
  ['uniform', 'uMouse', 'Mouse'],
  ['uniform', 'uForce', 'f32'],
  ['uniform', 'uRadius', 'f32'],
  ['uniform', 'uDiffusion', 'f32'],
  ['uniform', 'uTime', 'f32'],
  ['uniform', 'uDt', 'f32'],
)}

// cosine based palette, 4 vec3 params
fn palette(t : f32, a : vec3f, b : vec3f, c : vec3f, d : vec3f ) -> vec3f { return a + b*cos(6.28318*(c*t+d)); }

fn createSplat(pos : vec2f, splatPos : vec2f, vel : vec2f, radius : f32) -> vec3f {
  var p = pos - splatPos;
  p.x *= grid.dim.x / grid.dim.y;
  var v = vel;
  v.x *= grid.dim.x / grid.dim.y;
  return vec3f(exp(-dot(p, p) / radius) * length(v));
}

${MainDye}
  let col_incr = 0.15;
  let col_start = palette(uTime/8., vec3f(1), vec3f(0.5), vec3f(1), vec3f(0, col_incr, 2*col_incr));
  if (insideBoundary(pos, grid)) { return; }

  let shouldSplat = !insideBoundary(uMouse.pos * grid.dim, grid);
  var splat = vec3f(0);
  if (shouldSplat) { splat = 100 * createSplat(pos / grid.dye, uMouse.pos, 2*uMouse.vel, uRadius) * col_start*uForce*uDt; }
  dye_out[index] = vec4(dye_in[index].rgb * uDiffusion + splat, 1);
}`

const advect = `
${StructGridSize}

${createBindings(
  ['storage', 'p_in', 'array<vec2f>'],
  ['storage', 'v_in', 'array<vec2f>'],
  ['storage', 'p_out', 'array<vec2f>', true],
  ['uniform', 'grid', 'GridSize'],
  ['uniform', 'uDt', 'f32'],
)}

fn in(p : vec2f) -> vec2f { return p_in[ID(p)]; }

${MainInterior}
  if (insideBoundary(pos, grid)) { return; }

  var p = pos - uDt * grid.rdx * v_in[index];
${DeclareBilerped('p', 'grid.dim', 'in')}
  p_out[index] = bilerped;
}`

const advectDye = `
${StructGridSize}

${createBindings(
  ['storage', 'dye_in', 'array<vec4f>'],
  ['storage', 'v_in', 'array<vec2f>'],
  ['storage', 'dye_out', 'array<vec4f>', true],
  ['uniform', 'grid', 'GridSize'],
  ['uniform', 'uDt', 'f32'],
)}

fn in(p : vec2f) -> vec3f { return dye_in[ID(p)].rgb; }
fn vel(v : vec2f) -> vec2f {  return v_in[u32(i32(v.x) + i32(v.y) * i32(grid.dim.x))]; }

fn vel_bilerp(_p : vec2f) -> vec2f {
  var p = _p * grid.dim / grid.dye;
${DeclareBilerped('p', 'grid.dim', 'vel')}
  return bilerped;
}

${MainDye}
  var p = pos - uDt * grid.dyeRdx * vel_bilerp(pos);
${DeclareBilerped('p', 'grid.dye', 'in')}
  dye_out[index] = vec4(bilerped, 1);
}`

const divergence = `
${StructGridSize}

${createBindings(
  ['storage', 'v_in', 'array<vec2f>'],
  ['storage', 'div', 'array<f32>', true],
  ['uniform', 'grid', 'GridSize'],
)}

fn vel(v : vec2f) -> vec2f { return v_in[ID(v)]; }

${MainInterior}
${DeclareSideNeighbors('pos')}
  div[index] = 0.5 * grid.rdx * ((vel(R).x - vel(L).x) + (vel(T).y - vel(B).y));
}`

const pressure = `
${StructGridSize}

${createBindings(
  ['storage', 'pres_in', 'array<f32>'],
  ['storage', 'div', 'array<f32>'],
  ['storage', 'pres_out', 'array<f32>', true],
  ['uniform', 'grid', 'GridSize'],
)}

fn in(p : vec2f) -> f32 { return pres_in[ID(p)]; }

${MainInterior}
${DeclareSideNeighbors('pos')}

  pres_out[index] = (in(L) + in(R) + in(B) + in(T) - div[index] / (grid.rdx * grid.rdx)) * 0.25;
}`

const gradientSubtract = `
${StructGridSize}

${createBindings(
  ['storage', 'pressure', 'array<f32>'],
  ['storage', 'v_in', 'array<vec2f>'],
  ['storage', 'v_out', 'array<vec2f>', true],
  ['uniform', 'grid', 'GridSize'],
)}

fn pres(p : vec2f) -> f32 { return pressure[ID(p)]; }

${MainInterior}
${DeclareSideNeighbors('pos')}

  v_out[index] = v_in[index] - .5 * grid.rdx * vec2f(pres(R) - pres(L), pres(T) - pres(B));
}`

const vorticity = `
${StructGridSize}

${createBindings(
  ['storage', 'v_in', 'array<vec2f>'],
  ['storage', 'vorticity', 'array<f32>', true],
  ['uniform', 'grid', 'GridSize'],
)}

fn vel(p : vec2f) -> vec2f { return v_in[ID(p)]; }

${MainInterior}
${DeclareSideNeighbors('pos')}

  vorticity[index] = 0.5 * grid.rdx * ((vel(R).y - vel(L).y) - (vel(T).x - vel(B).x));
}`

const vorticityConfinment = `
${StructGridSize}

${createBindings(
  ['storage', 'v_in', 'array<vec2f>'],
  ['storage', 'vorticity', 'array<f32>'],
  ['storage', 'v_out', 'array<vec2f>', true],
  ['uniform', 'grid', 'GridSize'],
  ['uniform', 'uDt', 'f32'],
  ['uniform', 'uVorticity', 'f32'],
)}

fn vort(p : vec2f) -> f32 { return vorticity[ID(p)]; }

${MainInterior}
${DeclareSideNeighbors('pos')}

  let epsilon = 2.4414e-4;
  var force = 0.5 * grid.rdx * vec2f(abs(vort(T)) - abs(vort(B)), abs(vort(R)) - abs(vort(L)));
  force *= (uVorticity * uDt * vorticity[index] / (grid.rdx * max(epsilon, dot(force, force))));

  v_out[index] = v_in[index] + force * vec2(1, -1);
}`

const clearPressure = `
${StructGridSize}

${createBindings(
  ['storage', 'p_in', 'array<f32>'],
  ['storage', 'p_out', 'array<f32>', true],
  ['uniform', 'grid', 'GridSize'],
  ['uniform', 'uVisc', 'f32'],
)}

${MainFull}
  p_out[index] = p_in[index] * uVisc;
}`

const boundary = `
${StructGridSize}

${createBindings(
  ['storage', 'v_in', 'array<vec2f>'],
  ['storage', 'v_out', 'array<vec2f>', true],
  ['uniform', 'grid', 'GridSize'],
  ['uniform', 'containFluid', 'f32'],
)}

${MainFull}
  // Reflect at boundaries.
  var scale = vec2f(1);
  if (containFluid != 0) {
    if (pos.x <= 0) { pos.x = 1; scale.x = -1.; }
    else if (pos.x >= grid.dim.x - 1) { pos.x = grid.dim.x - 2; scale.x = -1.; }
    if (pos.y <= 0) { pos.y = 1; scale.y = -1.; }
    else if (pos.y >= grid.dim.y - 1) { pos.y = grid.dim.y - 2; scale.y = -1.; }
  }
  let bmin = grid.boundaryMin - vec2f(1, 1);
  let bmax = grid.boundaryMax + vec2f(1, 1);
  if (inside(pos, bmin, bmax)) {
    if (pos.x <= bmin.x) { pos.x = bmin.x - 1; scale.x = -1.; }
    else if (pos.x >= bmax.x) { pos.x = bmax.x + 1; scale.x = -1.; }
    if (pos.y <= bmin.y) { pos.y = bmin.y - 1; scale.y = -1.; }
    else if (pos.y >= bmax.y) { pos.y = bmax.y + 1; scale.y = -1.; }
  }

  v_out[index] = v_in[ID(pos)] * scale;
}`

const boundaryPressure = `
${StructGridSize}

${createBindings(
  ['storage', 'x_in', 'array<f32>'],
  ['storage', 'x_out', 'array<f32>', true],
  ['uniform', 'grid', 'GridSize'],
)}

${MainFull}
  if (pos.x <= 0) { pos.x = 1; }
  else if (pos.x >= grid.dim.x - 1) { pos.x = grid.dim.x - 2; }
  if (pos.y <= 0) { pos.y = 1; }
  else if (pos.y >= grid.dim.y - 1) { pos.y = grid.dim.y - 2; }

  let bmin = grid.boundaryMin - vec2f(1, 1);
  let bmax = grid.boundaryMax + vec2f(1, 1);
  if (inside(pos, bmin, bmax)) {
    if (pos.x <= bmin.x) { pos.x = bmin.x - 1; }
    else if (pos.x >= bmax.x) { pos.x = bmax.x + 1; }
    if (pos.y <= bmin.y) { pos.y = bmin.y - 1; }
    else if (pos.y >= bmax.y) { pos.y = bmax.y + 1; }
  }

  x_out[index] = x_in[ID(pos)];
}`

const checkerboard = `
${StructGridSize}

${createBindings(
  ['storage', 'col_out', 'array<vec4f>', true],
  ['uniform', 'grid', 'GridSize'],
  ['uniform', 'uTime', 'f32'],
)}

fn noise(p_ : vec3f) -> f32 {
  var p = p_;
  let ip = floor(p);
  p -= ip; 
  let s = vec3f(7.,157.,113.);
  var h = vec4f(0., s.y, s.z, s.y+s.z) + dot(ip, s);
  p = p * p * (3 - 2*p); 
  h = mix(fract(sin(h) * 43758.5), fract(sin(h + s.x)*43758.5), p.x);
  let r = mix(h.xz, h.yw, p.y);
  return mix(r.x, r.y, p.z); 
}

fn fbm(p_ : vec3f, octaveNum : i32) -> vec2f {
  let freq = 1.0;
  let shift = vec3f(100);
  var p = p_;
  var acc = vec2f(0);
  var amp = 0.5;
  for (var i = 0; i < octaveNum; i++) {
    acc += vec2f(noise(p), noise(p + vec3f(0, 0, 10))) * amp;
    p = 2*p + shift;
    amp *= 0.5;
  }
  return acc;
}

${MainDye}
  let uv = pos / grid.dye;
  let zoom = 4.;
  let smallNoise = fbm(vec3f((2 * uv * zoom).xy, uTime + 2.145), 7) - .5;
  let bigNoise = fbm(vec3f((uv * zoom).xy, 0.1 * uTime + 30), 7) - .5;
  let noise = max(length(bigNoise) * 0.035, 0.) + max(length(smallNoise) * 0.035, 0.) * .05;

  col_out[index] += noise * vec4f(1);
}`

// 3D Smoke Rendering inspired from @xjorma's shader:
// https://www.shadertoy.com/view/WlVyRV
const render = `
${StructGridSize}
${StructMouse}

struct VertexOut {
  @builtin(position) position : vec4f,
  @location(1) uv : vec2f,
};

struct SmokeData {
  raymarchSteps: f32,
  smokeDensity: f32,
  enableShadows: f32,
  shadowIntensity: f32,
  smokeHeight: f32,
  lightHeight: f32, 
  lightIntensity: f32,
  lightFalloff: f32,
}

${createBindings(
  ['storage', 'field', 'array<vec4f>'],
  ['uniform', 'grid', 'GridSize'],
  ['uniform', 'uMouse', 'Mouse'],
  ['uniform', 'renderMode', 'f32'], // 0: Classic, 1: Smoke2D, 2: Smoke3D
  ['uniform', 'smokeData', 'SmokeData'],
)}

@vertex
fn vertex_main(@location(0) position: vec4f) -> VertexOut {return VertexOut(position, position.xy * .5 + .5); }

fn getDye(pos : vec3f) -> vec3f {
  var uv = vec2f(pos.x * grid.dim.y / grid.dim.x, pos.y) * 0.5 + 0.5;
  if (max(uv.x, uv.y) > 1 || min(uv.x, uv.y) < 0) { return vec3f(0); }

  uv = floor(uv * grid.dye);
  return field[u32(uv.x + uv.y * grid.dye.x)].rgb;
}

fn getLevel(dye: vec3f) -> f32 { return max(dye.r, max(dye.g, dye.b)); }

fn getMousePos() -> vec2f {
  let pos = 2 * (uMouse.pos - .5);
  return vec2f(pos.x * grid.dim.x / grid.dim.y, pos.y);
}

fn getShadow(p: vec3f, lightPos: vec3f, fogSlice: f32) -> f32 {
  let lightDir: vec3f = normalize(lightPos - p);
  let lightDist: f32 = pow(max(0., dot(lightPos - p, lightPos - p) - smokeData.lightIntensity + 1.), smokeData.lightFalloff);
  var shadowDist: f32 = 0;
  for (var i: f32 = 1.; i <= smokeData.raymarchSteps; i += 1.) {
    let sp: vec3f = p + mix(0., lightDist*smokeData.smokeHeight, i / smokeData.raymarchSteps) * lightDir;
    if (sp.z > smokeData.smokeHeight) { break; }

    let height: f32 = getLevel(getDye(sp)) * smokeData.smokeHeight;
    shadowDist += min(max(0., height - sp.z), fogSlice);
  }
  
  return exp(-shadowDist * smokeData.shadowIntensity) / lightDist;
}

@fragment
fn fragment_main(fragData : VertexOut) -> @location(0) vec4f {
  if (renderMode != 2) {
    let fuv = floor(fragData.uv * grid.dye);
    return field[u32(fuv.x + fuv.y * grid.dye.x)];
  }

  // Smoke 3D

  var uv: vec2f = fragData.uv * 2 - 1;
  uv.x *= grid.dye.x / grid.dye.y;

  let theta: f32 = -1.5708;
  let pi: f32 = 3.141592653589793;
  let phi = pi + 0.0001; // - (uMouse.pos.y - .5);
  let parralax: f32 = 20.;
  var ro = parralax * vec3f(sin(phi)*cos(theta), cos(phi), sin(phi)*sin(theta));
  let cw = normalize(-ro);
  let cu = normalize(cross(cw, vec3f(0, 0, 1)));
  let cv = normalize(cross(cu, cw));
  let ca = mat3x3(cu, cv, cw);
  let rd = (ca*normalize(vec3f(uv, parralax))).xzy;
  ro = ro.xzy;

  let bgCol = vec3f(0);
  let fogSlice = smokeData.smokeHeight / smokeData.raymarchSteps;
  let near = (smokeData.smokeHeight - ro.z) / rd.z;
  let far = -ro.z / rd.z;
  let lightPos: vec3f = vec3f(getMousePos(), smokeData.lightHeight);

  var transmittance = 1.;
  var col = vec3f(0);
  for (var i: f32 = 0.; i <= smokeData.raymarchSteps; i += 1.) {
    let p: vec3f = ro + mix(near, far, i / smokeData.raymarchSteps) * rd;
    let dyeColor: vec3f = getDye(p);
    let height: f32 = getLevel(dyeColor) * smokeData.smokeHeight;
    let smpl: f32 = clamp(height - p.z, 0.0, fogSlice);
    if (smpl > .0001) {
      let shadow: f32 = select(1., getShadow(p, lightPos, fogSlice), smokeData.enableShadows > 0);
      let dens: f32 = smpl * smokeData.smokeDensity;
      col += shadow * dens * transmittance * dyeColor;
      transmittance *= 1 - dens;
    } 
  }

  return vec4(mix(bgCol, col, 1 - transmittance), 1);
}`

export default {
  advect,
  advectDye,
  boundary,
  boundaryPressure,
  checkerboard,
  clearPressure,
  divergence,
  gradientSubtract,
  pressure,
  render,
  updateVelocity,
  updateDye,
  vorticity,
  vorticityConfinment,
}
