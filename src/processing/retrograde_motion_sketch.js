// https://shoffing.wordpress.com/2013/02/22/automatically-scaling-a-processing-js-sketch-to-fit-the-browser-window/comment-page-1/#comment-149

function getBackgroundColor() {
  const parentStyle = window.getComputedStyle(document.getElementById('retrograde-motion-parent'));
  return parentStyle.backgroundColor;
}

function fadeColor(p, color, amount, limit) {
  let newAlpha = p.alpha(color) * amount;
  if (limit && newAlpha < 60) {
    newAlpha = 60;
  }
  return p.color(p.red(color), p.green(color), p.blue(color), newAlpha);
}

const AU = 149598000.0; // Astronomical Unit, in km
const SCALE_FACTOR = 2000000000.0;  // scale of whole sketch in km
const SCALE_SUN = 0.0170; // da Sun is big...
const SCALE_PLANETS = 3200.0; // da planets are small...
const SIM_SPEED = .30;  // controls the speed of all things
const APPROACHING_DIST = 0.0650;

const FRAME_SAVE_FREQUENCY = 30;
const MAX_SAVED_STATES = 10;

const BACKGROUND_COLOR_STR = 'rgb(85, 170, 216)';
const FOREGROUND_COLOR_STR = 'rgb(221, 250, 252)';
var BACKGROUND_COLOR;

var sun, earth, mars;

export default function sketch(p) {
  var parentColor = 100;
  var currState;
  var pastStates = []

  p.windowResized = function() {
    const parentStyle = window.getComputedStyle(document.getElementById('retrograde-motion-parent'))
    const setupWidth = parseFloat(parentStyle.width) - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight)
    const setupHeight = setupWidth;
    p.resizeCanvas(setupWidth, setupHeight);
    onSizeChange();
  }

  function onSizeChange() {
    if (sun != null && earth != null && mars != null) {
      sun.onSizeChange();
      earth.onSizeChange();
      earth.orbitSpeed *= 1.2; // make orbit speed difference more dramatic
      mars.onSizeChange();
    }
  }

  p.setup = function () {
    BACKGROUND_COLOR = p.color(BACKGROUND_COLOR_STR);
    parentColor = p.color(getBackgroundColor());
    p.createCanvas(600, 400);
    p.noStroke();
    p.windowResized();

    p.textAlign(p.CENTER, p.CENTER);
    p.ellipseMode(p.RADIUS);

    /** http://wiki.answers.com/Q/What_is_the_distance_of_all_planets_from_the_sun#ixzz1LwdqB0Qt
      Sun:
        Radius: 700k km
        Mass: 1.98892 * 10^30 kg  
  
      Earth:
        Radius: 6400 km
        Period: 1
        Ellipse e: 0.017
        Mass: 5.97 * 10^24
        Path Angle: 7.155 degrees
      
      Mars:
        Radius: 3400 km
        Period: 1.881
        Ellipse e: 0.093
        Mass: 6.42 * 10^23
        Path Angle: 5.65 degrees
    ****************************/

    sun = new Planet(p, 'Sun', 700000.0 * SCALE_SUN, 0, 0, 0);
    earth = new Planet(p, 'Earth', 6400.0, 1, -0.017, 0);
    mars = new Planet(p, 'Mars', 3400.0, 1.881, -0.093, 250);
    onSizeChange();
    currState = new SavedState(p, earth.pos, mars.pos);
  };

  p.myCustomRedrawAccordingToNewPropsHandler = function (props) {

  };

  let approaching = false;

  p.draw = function() {
    if (!currState) {
      return;
    }

    p.background(parentColor);
  
    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.fill(BACKGROUND_COLOR);
    p.ellipse(0, 0, p.width / 2, p.height / 2);
    sun.draw(p, sun.pos, p.color('rgb(254, 210, 73)'));
    earth.tick();
    mars.tick();
  
    if (currState) {
      currState.drawOrbits();
      currState.drawLineOfSight(1);
      currState.drawPlanets(p);
    }

    pastStates.forEach((pastState) => {
      if (pastState) {
        pastState.drawLineOfSight(3);
        pastState.drawPlanets(p);
        pastState.fade(.97);
      }
    })
    p.pop();
  
    if (earth.pos.distanceTo(mars.pos) < APPROACHING_DIST * p.width) {
      if (!approaching) {
        pastStates = []
        approaching = true;
      }
    } else {
      approaching = false;
    }
  
    if (approaching && p.frameCount % FRAME_SAVE_FREQUENCY === 0) {
      const savedState = new SavedState(p, earth.pos.copy(), mars.pos.copy());
      const index = (p.frameCount / FRAME_SAVE_FREQUENCY) % MAX_SAVED_STATES
      pastStates[index] = savedState;
    }
  };
};

class Vec2D {
  constructor(x, y) {
    this.set(x, y);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    return new Vec2D(this.x + other.x, this.y + other.y);
  }

  sub(other) {
    return new Vec2D(this.x - other.x, this.y - other.y);
  }

  mult(other) {
    return new Vec2D(this.x * other.x, this.y * other.y);
  }

  scaleInPlace(value) {
    this.x *= value;
    this.y *= value;

    return this;
  }

  copy() {
    return new Vec2D(this.x, this.y);
  }

  scalar() {
    return this.x + this.y;
  }

  magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }

  magnitude() {
    return Math.sqrt(this.magnitudeSquared());
  }

  distanceTo(other) {
    return other.sub(this).magnitude();
  }

  distanceToSquared(other) {
    return other.sub(this).magnitudeSquared();
  }

  radians(other) {
    return Math.acos(
      this.mult(other).scalar() /
      (this.magnitude() * other.magnitude())
    );
  }
};

class Planet {
  constructor(p, name, radius, ellipseA, ellipseE, startDegrees) {
    this.p = p; // processing
    this.name = name;

    this.radiusUnscaled = radius;
    this.ellipseAUnscaled = ellipseA;
    this.ellipseE = ellipseE;

    this.pathAngleRadians = p.radians(startDegrees);

    this.pos = new Vec2D(0, 0);

    this.onSizeChange();
  }

  onSizeChange() {
    this.radius = this.p.map(this.radiusUnscaled, 0, SCALE_FACTOR, 0, this.p.width / 2) * SCALE_PLANETS;
    this.ellipseA = this.p.map(this.ellipseAUnscaled * AU, 0, SCALE_FACTOR, 0, this.p.width / 2);
    this.ellipseB = this.ellipseA * Math.sqrt(1 - this.ellipseE * this.ellipseE);
    this.ellipseCenter = this.ellipseA * this.ellipseE;
    this.orbitSpeed = (this.ellipseA === 0) ? 0 : (this.p.width / 500) / this.ellipseA;
  }

  tick() {
    this.pathAngleRadians += this.orbitSpeed * SIM_SPEED;
    this.pos.set(this.ellipseCenter + this.ellipseA * Math.sin(this.pathAngleRadians), this.ellipseB * Math.cos(this.pathAngleRadians));
  }

  draw(p, pos, fillColor) {
    p.push()
    p.noStroke();
    p.translate(pos.x, pos.y);
    let fadedColor = fillColor;
    for (let i = 1; i < 3; i++) {
      this.p.fill(fadedColor);
      this.p.ellipse(0, 0, this.radius + i, this.radius + i);
      fadedColor = fadeColor(this.p, fillColor, .6, false);
    }
    p.pop()
  }

  drawOrbit() {
    this.p.noFill();
    this.p.strokeWeight(2);
    this.p.stroke(this.p.color(FOREGROUND_COLOR_STR));
    this.p.ellipse(this.ellipseCenter, 0, this.ellipseA, this.ellipseB);
  }
};

class SavedState {
  constructor(p, earthPos, marsPos) {
    this.p = p // processing
    this.earthPos = earthPos;
    this.marsPos = marsPos;
    this.lineColor = p.color(FOREGROUND_COLOR_STR);
    this.earthColor = p.color('rgb(121, 244, 82)');
    this.marsColor = p.color('rgb(236, 118, 82)');
  }

  fade(amount) {
    this.lineColor = fadeColor(this.p, this.lineColor, amount, true);
    this.earthColor = fadeColor(this.p, this.earthColor, amount, true);
    this.marsColor = fadeColor(this.p, this.marsColor, amount, true);
  }

  drawPlanets(p) {
    earth.draw(p, this.earthPos, this.earthColor);
    mars.draw(p, this.marsPos, this.marsColor);
  }

  drawOrbits() {
    earth.drawOrbit();
    mars.drawOrbit();
  }

  drawLineOfSight(weight) {
    this.p.strokeWeight(weight);
    const l = this.marsPos.sub(this.earthPos).scaleInPlace(this.p.width / 2);
    this.p.stroke(this.lineColor);
    this.p.line(this.earthPos.x, this.earthPos.y, l.x, l.y);
  }
};
