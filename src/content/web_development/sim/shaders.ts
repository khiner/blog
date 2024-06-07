const StructGridSize = `struct GridSize { w : f32, h : f32, dyeW: f32, dyeH: f32, dx : f32, rdx : f32, dyeRdx : f32 }`
const StructMouse = `struct Mouse { pos: vec2f, vel: vec2f }`

// Initialize the pos and index variables and target the cells in the given grid
const createComputeStart = (w: [string, string], h: [string, string]) => `
var pos = vec2f(global_id.xy);
if (pos.x <= ${w[0]} || pos.y <= ${h[0]} || pos.x >= ${w[1]} || pos.y >= ${h[1]}) { return; }
let index = ID(pos);`
const ComputeStartInterior = createComputeStart(['0', 'uGrid.w - 1'], ['0', 'uGrid.h - 1'])
const ComputeStartDye = createComputeStart(['0', 'uGrid.dyeW - 1'], ['0', 'uGrid.dyeH - 1'])
const ComputeStartAll = createComputeStart(['-1', 'uGrid.w'], ['-1', 'uGrid.h'])

const createIdFunction = (w: string) => `fn ID(p : vec2f) -> u32 { return u32(p.x + p.y * ${w}); }`

const updateVelocity = `
${StructGridSize}
${StructMouse}

@group(0) @binding(0) var<storage, read> v_in : array<vec2f>;
@group(0) @binding(1) var<storage, read_write> v_out : array<vec2f>;
@group(0) @binding(2) var<uniform> uGrid: GridSize;
@group(0) @binding(3) var<uniform> uMouse: Mouse;
@group(0) @binding(4) var<uniform> uForce : f32;
@group(0) @binding(5) var<uniform> uRadius : f32;
@group(0) @binding(6) var<uniform> uDiffusion : f32;
@group(0) @binding(7) var<uniform> uDt : f32;

${createIdFunction('uGrid.w')}
fn inBetween(x : f32, lower : f32, upper : f32) -> bool { return x > lower && x < upper; }
fn inBounds(pos : vec2f, xMin : f32, xMax : f32, yMin: f32, yMax : f32) -> bool {
  return inBetween(pos.x, xMin * uGrid.w, xMax * uGrid.w) && inBetween(pos.y, yMin * uGrid.h, yMax * uGrid.h);
}

fn createSplat(pos : vec2f, splatPos : vec2f, vel : vec2f, radius : f32) -> vec2f {
  var p = pos - splatPos;
  p.x *= uGrid.w / uGrid.h;
  var v = vel;
  v.x *= uGrid.w / uGrid.h;
  return exp(-dot(p, p) / radius) * v;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    ${ComputeStartInterior}

    let p = pos / vec2(uGrid.w, uGrid.h);
    let splat = createSplat(p, uMouse.pos,  uMouse.vel*2., uRadius) * uForce * uDt * 200.;
    v_out[index] = v_in[index] * uDiffusion + splat;
}`

const updateDye = `
${StructGridSize}
${StructMouse}

@group(0) @binding(0) var<storage, read> dye_in : array<vec4<f32>>;
@group(0) @binding(1) var<storage, read_write> dye_out : array<vec4<f32>>;
@group(0) @binding(2) var<uniform> uGrid: GridSize;
@group(0) @binding(3) var<uniform> uMouse: Mouse;
@group(0) @binding(4) var<uniform> uForce : f32;
@group(0) @binding(5) var<uniform> uRadius : f32;
@group(0) @binding(6) var<uniform> uDiffusion : f32;
@group(0) @binding(7) var<uniform> uTime : f32;
@group(0) @binding(8) var<uniform> uDt : f32;

${createIdFunction('uGrid.dyeW')}
fn inBetween(x : f32, lower : f32, upper : f32) -> bool { return x > lower && x < upper; }
fn inBounds(pos : vec2f, xMin : f32, xMax : f32, yMin: f32, yMax : f32) -> bool {
  return inBetween(pos.x, xMin * uGrid.dyeW, xMax * uGrid.dyeW) && inBetween(pos.y, yMin * uGrid.dyeH, yMax * uGrid.dyeH);
}
// cosine based palette, 4 vec3 params
fn palette(t : f32, a : vec3f, b : vec3f, c : vec3f, d : vec3f ) -> vec3f { return a + b*cos(6.28318*(c*t+d)); }

fn createSplat(pos : vec2f, splatPos : vec2f, vel : vec2f, radius : f32) -> vec3f {
  var p = pos - splatPos;
  p.x *= uGrid.w / uGrid.h;
  var v = vel;
  v.x *= uGrid.w / uGrid.h;
  var splat = exp(-dot(p, p) / radius) * length(v);
  return vec3(splat);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    ${ComputeStartDye}

    let col_incr = 0.15;
    let col_start = palette(uTime/8., vec3(1), vec3(0.5), vec3(1), vec3(0, col_incr, 2*col_incr));
    let p = pos / vec2(uGrid.dyeW, uGrid.dyeH);
    let splat = 100 * createSplat(p, uMouse.pos, 2*uMouse.vel, uRadius) * col_start * uForce * uDt;
    dye_out[index] = vec4(dye_in[index].rgb * uDiffusion + splat, 1);
}`

const advect = `
${StructGridSize}

@group(0) @binding(0) var<storage, read> p_in : array<vec2f>;
@group(0) @binding(1) var<storage, read> v_in : array<vec2f>;
@group(0) @binding(2) var<storage, read_write> p_out : array<vec2f>;
@group(0) @binding(3) var<uniform> uGrid : GridSize;
@group(0) @binding(4) var<uniform> uDt : f32;

${createIdFunction('uGrid.w')}
fn in(p : vec2f) -> vec2f { return p_in[ID(p)]; }

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    ${ComputeStartInterior}

    var p = pos - uDt * uGrid.rdx * v_in[index];
    if (p.x < 0) { p.x = 0; }
    else if (p.x >= uGrid.w - 1) { p.x = uGrid.w - 1; }
    if (p.y < 0) { p.y = 0; }
    else if (p.y >= uGrid.h - 1) { p.y = uGrid.h - 1; }

    let p1 = floor(p);
    let p2 = p1 + 1;
    let TL = in(vec2(p1.x, p2.y));
    let TR = in(p2);
    let BL = in(p1);
    let BR = in(vec2(p2.x, p1.y));

    let m = fract(p);
    p_out[index] = mix(mix(BL, BR, m.x), mix(TL, TR, m.x), m.y);
}`

const advectDye = `
${StructGridSize}

@group(0) @binding(0) var<storage, read> dye_in : array<vec4<f32>>;
@group(0) @binding(1) var<storage, read> v_in : array<vec2f>;
@group(0) @binding(2) var<storage, read_write> dye_out : array<vec4<f32>>;
@group(0) @binding(3) var<uniform> uGrid : GridSize;
@group(0) @binding(4) var<uniform> uDt : f32;

${createIdFunction('uGrid.dyeW')}
fn in(p : vec2f) -> vec3f { return dye_in[ID(p)].rgb; }
fn vel(v : vec2f) -> vec2f {  return v_in[u32(i32(v.x) + i32(v.y) * i32(uGrid.w))]; }

fn vel_bilerp(p : vec2f) -> vec2f {
    var x = p.x * uGrid.w / uGrid.dyeW;
    var y = p.y * uGrid.h / uGrid.dyeH;
    if (x < 0) { x = 0; }
    else if (x >= uGrid.w - 1) { x = uGrid.w - 1; }
    if (y < 0) { y = 0; }
    else if (y >= uGrid.h - 1) { y = uGrid.h - 1; }

    let p1 = floor(vec2(x, y));
    let p2 = p1 + 1;
    let TL = vel(vec2(p1.x, p2.y));
    let TR = vel(p2);
    let BL = vel(p1);
    let BR = vel(vec2(p2.x, p1.y));

    let m = vec2(fract(x), fract(y));
    return mix(mix(BL, BR, m.x), mix(TL, TR, m.x), m.y);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    ${ComputeStartDye}

    var p = pos - uDt * uGrid.dyeRdx * vel_bilerp(pos);
    if (p.x < 0) { p.x = 0; }
    else if (p.x >= uGrid.dyeW - 1) { p.x = uGrid.dyeW - 1; }
    if (p.y < 0) { p.y = 0; }
    else if (p.y >= uGrid.dyeH - 1) { p.y = uGrid.dyeH - 1; }

    let p1 = floor(p);
    let p2 = p1 + 1;
    let TL = in(vec2(p1.x, p2.y));
    let TR = in(p2);
    let BL = in(p1);
    let BR = in(vec2(p2.x, p1.y));

    let m = fract(p);
    dye_out[index] = vec4(mix(mix(BL, BR, m.x), mix(TL, TR, m.x), m.y), 1);
}`

const divergence = `
${StructGridSize}

@group(0) @binding(0) var<storage, read> v_in : array<vec2f>;
@group(0) @binding(1) var<storage, read_write> div : array<f32>;
@group(0) @binding(2) var<uniform> uGrid : GridSize;

${createIdFunction('uGrid.w')}
fn vel(v : vec2f) -> vec2f { return v_in[ID(v)]; }

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  ${ComputeStartInterior}

  let L = vel(vec2(pos.x - 1, pos.y)).x;
  let R = vel(vec2(pos.x + 1, pos.y)).x;
  let B = vel(vec2(pos.x, pos.y - 1)).y;
  let T = vel(vec2(pos.x, pos.y + 1)).y;

  div[index] = 0.5 * uGrid.rdx * ((R - L) + (T - B));
}`

const pressure = `
${StructGridSize}

@group(0) @binding(0) var<storage, read> pres_in : array<f32>;
@group(0) @binding(1) var<storage, read> div : array<f32>;
@group(0) @binding(2) var<storage, read_write> pres_out : array<f32>;
@group(0) @binding(3) var<uniform> uGrid : GridSize;

${createIdFunction('uGrid.w')}
fn in(p : vec2f) -> f32 { return pres_in[ID(p)]; }

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  ${ComputeStartInterior}

  let L = pos - vec2(1, 0);
  let R = pos + vec2(1, 0);
  let B = pos - vec2(0, 1);
  let T = pos + vec2(0, 1);

  let bC = div[index];
  let alpha = -(uGrid.dx * uGrid.dx);
  pres_out[index] = (in(L) + in(R) + in(B) + in(T) + alpha * bC) * 0.25;
}`

const gradientSubtract = `
${StructGridSize}

@group(0) @binding(0) var<storage, read> pressure : array<f32>;
@group(0) @binding(1) var<storage, read> v_in : array<vec2f>;
@group(0) @binding(2) var<storage, read_write> v_out : array<vec2f>;
@group(0) @binding(3) var<uniform> uGrid : GridSize;

${createIdFunction('uGrid.w')}
fn pres(p : vec2f) -> f32 { return pressure[ID(p)]; }

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  ${ComputeStartInterior}

  let L = pos - vec2(1, 0);
  let R = pos + vec2(1, 0);
  let B = pos - vec2(0, 1);
  let T = pos + vec2(0, 1);

  v_out[index] = v_in[index] - .5 * uGrid.rdx * vec2(pres(R) - pres(L), pres(T) - pres(B));
}`

const vorticity = `
${StructGridSize}

@group(0) @binding(0) var<storage, read> v_in : array<vec2f>;
@group(0) @binding(1) var<storage, read_write> vorticity : array<f32>;
@group(0) @binding(2) var<uniform> uGrid : GridSize;

${createIdFunction('uGrid.w')}
fn vel(p : vec2f) -> vec2f { return v_in[ID(p)]; }

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  ${ComputeStartInterior}

  let Ly = vel(vec2(pos.x - 1, pos.y)).y;
  let Ry = vel(vec2(pos.x + 1, pos.y)).y;
  let Bx = vel(vec2(pos.x, pos.y - 1)).x;
  let Tx = vel(vec2(pos.x, pos.y + 1)).x;

  vorticity[index] = 0.5 * uGrid.rdx * ((Ry - Ly) - (Tx - Bx));
}`

const vorticityConfinment = `
${StructGridSize}

@group(0) @binding(0) var<storage, read> v_in : array<vec2f>;
@group(0) @binding(1) var<storage, read> vorticity : array<f32>;
@group(0) @binding(2) var<storage, read_write> v_out : array<vec2f>;
@group(0) @binding(3) var<uniform> uGrid : GridSize;
@group(0) @binding(4) var<uniform> uDt : f32;
@group(0) @binding(5) var<uniform> uVorticity : f32;

${createIdFunction('uGrid.w')}
fn vort(p : vec2f) -> f32 { return vorticity[ID(p)]; }

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  ${ComputeStartInterior}

  let L = vort(vec2(pos.x - 1, pos.y));
  let R = vort(vec2(pos.x + 1, pos.y));
  let B = vort(vec2(pos.x, pos.y - 1));
  let T = vort(vec2(pos.x, pos.y + 1));
  let C = vorticity[index];

  let epsilon = 2.4414e-4;
  var force = 0.5 * uGrid.rdx * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= max(epsilon, dot(force, force));
  force *= uGrid.dx * uVorticity * uDt * C * vec2(1, -1);

  v_out[index] = v_in[index] + force;
}`

const clearPressure = `
${StructGridSize}

@group(0) @binding(0) var<storage, read> p_in : array<f32>;
@group(0) @binding(1) var<storage, read_write> p_out : array<f32>;
@group(0) @binding(2) var<uniform> uGrid : GridSize;
@group(0) @binding(3) var<uniform> uVisc : f32;

${createIdFunction('uGrid.w')}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  ${ComputeStartAll}

  p_out[index] = p_in[index] * uVisc;
}`

const boundary = `
${StructGridSize}

@group(0) @binding(0) var<storage, read> p_in : array<vec2f>;
@group(0) @binding(1) var<storage, read_write> p_out : array<vec2f>;
@group(0) @binding(2) var<uniform> uGrid : GridSize;
@group(0) @binding(3) var<uniform> containFluid : f32;

${createIdFunction('uGrid.w')}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  ${ComputeStartAll}

  var scale = vec2f(1); // disable scale to disable contained bounds
  if (pos.x == 0) { pos.x += 1; scale.x = -1.; }
  else if (pos.x == uGrid.w - 1) { pos.x -= 1; scale.x = -1.; }
  if (pos.y == 0) { pos.y += 1; scale.y = -1.; }
  else if (pos.y == uGrid.h - 1) { pos.y -= 1; scale.y = -1.; }

  if (containFluid == 0.) { scale = vec2(1.); }

  p_out[index] = p_in[ID(pos)] * scale;
}`

const boundaryPressure = `
${StructGridSize}

@group(0) @binding(0) var<storage, read> x_in : array<f32>;
@group(0) @binding(1) var<storage, read_write> x_out : array<f32>;
@group(0) @binding(2) var<uniform> uGrid : GridSize;

${createIdFunction('uGrid.w')}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  ${ComputeStartAll}

  if (pos.x == 0) { pos.x += 1; }
  else if (pos.x == uGrid.w - 1) { pos.x -= 1; }
  if (pos.y == 0) { pos.y += 1; }
  else if (pos.y == uGrid.h - 1) { pos.y -= 1; }

  x_out[index] = x_in[ID(pos)];
}`

const checkerboard = `
${StructGridSize}

@group(0) @binding(0) var<storage, read_write> col_out : array<vec4<f32>>;
@group(0) @binding(1) var<uniform> uGrid : GridSize;
@group(0) @binding(2) var<uniform> uTime : f32;

${createIdFunction('uGrid.dyeW')}

fn noise(p_ : vec3f) -> f32 {
  var p = p_;
  let ip = floor(p);
  p -= ip; 
  var s = vec3(7.,157.,113.);
  var h = vec4(0., s.y, s.z, s.y+s.z) + dot(ip, s);
  p = p * p * (3 - 2*p); 
  h = mix(fract(sin(h) * 43758.5), fract(sin(h + s.x)*43758.5), p.x);
  let r = mix(h.xz, h.yw, p.y);
  return mix(r.x, r.y, p.z); 
}

fn fbm(p_ : vec3f, octaveNum : i32) -> vec2f {
  let freq = 1.0;
  let shift = vec3(100.);
  var p = p_;
  var acc = vec2(0.);	
  var amp = 0.5;
  for (var i = 0; i < octaveNum; i++) {
    acc += vec2(noise(p), noise(p + vec3(0, 0, 10))) * amp;
    p = 2*p + shift;
    amp *= 0.5;
  }
  return acc;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  ${ComputeStartDye}

  let uv = pos / vec2(uGrid.dyeW, uGrid.dyeH);
  let zoom = 4.;
  let smallNoise = fbm(vec3((2 * uv * zoom).xy, uTime + 2.145), 7) - .5;
  let bigNoise = fbm(vec3((uv * zoom).xy, 0.1 * uTime + 30), 7) - .5;
  let noise = max(length(bigNoise) * 0.035, 0.) + max(length(smallNoise) * 0.035, 0.) * .05;

  col_out[index] += noise * vec4(1.);
}`

// 3D Smoke Rendering inspired from @xjorma's shader:
// https://www.shadertoy.com/view/WlVyRV
const render = `
${StructGridSize}
${StructMouse}

struct VertexOut {
  @builtin(position) position : vec4<f32>,
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

@group(0) @binding(0) var<storage, read> field : array<vec4<f32>>;
@group(0) @binding(1) var<uniform> uGrid : GridSize;
@group(0) @binding(2) var<uniform> uMouse : Mouse;
@group(0) @binding(3) var<uniform> renderMode : f32; // 0: Classic, 1: Smoke2D, 2: Smoke3D
@group(0) @binding(4) var<uniform> multiplier : f32;
@group(0) @binding(5) var<uniform> smokeData : SmokeData;

@vertex
fn vertex_main(@location(0) position: vec4<f32>) -> VertexOut {return VertexOut(position, position.xy * .5 + .5); }

fn hash12(p: vec2f) -> f32 {
  var p3: vec3f  = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

fn getDye(pos : vec3f) -> vec3f {
  var uv = vec2(pos.x * uGrid.h / uGrid.w, pos.y) * 0.5 + 0.5;
  if (max(uv.x, uv.y) > 1 || min(uv.x, uv.y) < 0) { return vec3f(0); }

  uv = floor(uv*vec2(uGrid.dyeW, uGrid.dyeH));
  return field[u32(uv.x + uv.y * uGrid.dyeW)].rgb;
}

fn getLevel(dye: vec3f) -> f32 { return max(dye.r, max(dye.g, dye.b)); }

fn getMousePos() -> vec2f {
  let pos = 2 * (uMouse.pos - .5);
  return vec2(pos.x * uGrid.w / uGrid.h, pos.y);
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
fn fragment_main(fragData : VertexOut) -> @location(0) vec4<f32> {
    if (renderMode != 2) {
      let dim = vec2(uGrid.dyeW, uGrid.dyeH);
      let fuv = floor(fragData.uv * dim);
      let col = field[u32(fuv.x + fuv.y * dim.x)].rgb;
      return vec4(col * multiplier, 1);
    }

    // Smoke 3D

    let w = uGrid.dyeW;
    let h = uGrid.dyeH;
    var uv: vec2f = fragData.uv * 2 - 1;
    uv.x *= uGrid.dyeW / uGrid.dyeH;

    let theta = -1.5708;
    let phi = 3.141592 + 0.0001; // - (uMouse.pos.y - .5);
    let parralax = 20.;
    var ro: vec3f = parralax * vec3(sin(phi)*cos(theta),cos(phi),sin(phi)*sin(theta));
    let cw = normalize(-ro);
    let cu = normalize(cross(cw, vec3(0, 0, 1)));
    let cv = normalize(cross(cu, cw));
    let ca = mat3x3(cu, cv, cw);
    var rd =  ca*normalize(vec3(uv, parralax));
    ro = ro.xzy; rd = rd.xzy;

    let bgCol: vec3f = vec3(0,0,0);
    let fogSlice = smokeData.smokeHeight / smokeData.raymarchSteps;

    let near: f32 = (smokeData.smokeHeight - ro.z) / rd.z;
    let far: f32  = -ro.z / rd.z;

    let m = getMousePos();
    let lightPos: vec3f = vec3(m, smokeData.lightHeight);

    var transmittance: f32 = 1;
    var col: vec3f = vec3(0.35,0.35,0.35) * 0.;

    for (var i: f32 = 0.; i <= smokeData.raymarchSteps; i += 1.) {
      let p: vec3f = ro + mix(near, far, i / smokeData.raymarchSteps) * rd;

      let dyeColor: vec3f = getDye(p);
      let height: f32 = getLevel(dyeColor) * smokeData.smokeHeight;
      let smple: f32 = min(max(0., height - p.z), fogSlice);
      if (smple > .0001) {
        var shadow: f32 = select(1., getShadow(p, lightPos, fogSlice), smokeData.enableShadows > 0);
        let dens: f32 = smple * smokeData.smokeDensity;
        col += shadow * dens * transmittance * dyeColor;
        transmittance *= 1 - dens;
      } 
    }

    return vec4(mix(bgCol, col, 1. - transmittance), 1);
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
