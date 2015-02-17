/**
  Author: Karl Hiner
*/

// https://shoffing.wordpress.com/2013/02/22/automatically-scaling-a-processing-js-sketch-to-fit-the-browser-window/comment-page-1/#comment-149
function doResize() {
  var setupWidth = $('#retrograde-motion-parent').width();

  var setupHeight = setupWidth;
  $('#retrograde-motion-canvas').height(setupHeight);
  size(setupWidth, setupHeight);
  onSizeChange();
}
$(window).resize(doResize);

// convert CSS background color to something Processing can use
// based on http://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value
function hex(rgbValue) {
  return ('0' + parseInt(rgbValue).toString(16)).slice(-2);
}

function rgbToHex(rgb) {
  var rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return (rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function getBackgroundColor() {
  return rgbToHex($('#retrograde-motion-parent').css('background-color'));
}

color fadeColor(color c, float amt, boolean limit) {
  int newAlpha = alpha(c) * amt;
  if (limit && newAlpha < 60)
    newAlpha = 60;
  return color(red(c), green(c), blue(c), newAlpha);
}

class Vec2D {
  float x, y;

  Vec2D(float x, float y) {
    set(x, y);
  }

  void set(float x, float y) {
    this.x = x;
    this.y = y;
  }

  Vec2D add(Vec2D other) {
    return new Vec2D(x + other.x, y + other.y);
  }

  Vec2D sub(Vec2D other) {
    return new Vec2D(x - other.x, y - other.y);
  }

  Vec2D mult(Vec2D other) {
    return new Vec2D(x * other.x, y * other.y);
  }

  Vec2D scaleInPlace(float value) {
    this.x *= value;
    this.y *= value;

    return this;
  }

  Vec2D copy() {
    return new Vec2D(x, y);
  }

  float scalar() {
    return x + y;
  }

  float magnitudeSquared() {
    return x * x + y * y;
  }

  float magnitude() {
    return sqrt(magnitudeSquared());
  }

  float distanceTo(Vec2D other) {
    return other.sub(this).magnitude();
  }

  float distanceToSquared(Vec2D other) {
    return other.sub(this).magnitudeSquared();
  }

  float radians(Vec2D other) {
    return acos(
      mult(other).scalar() /
      (magnitude() * other.magnitude())
    );
  }
};

class Planet {
  String name;
  float radiusUnscaled, radius;
  float ellipseAUnscaled, ellipseA;
  float ellipseE;
  float ellipseB;
  float ellipseCenter;
  float orbitSpeed;
  float pathAngleRadians;
  Vec2D pos;

  Planet(String name, float radius, float ellipseA, float ellipseE, float startDegrees) {
    this.name = name;

    this.radiusUnscaled = radius;
    this.ellipseAUnscaled = ellipseA;
    this.ellipseE = ellipseE;

    pathAngleRadians = radians(startDegrees);

    pos = new Vec2D(0, 0);

    onSizeChange();
  }

  void onSizeChange() {
    radius = map(radiusUnscaled, 0, SCALE_FACTOR, 0, width / 2) * SCALE_PLANETS;
    ellipseA = map(ellipseAUnscaled * AU, 0, SCALE_FACTOR, 0, width / 2);
    ellipseB = (float) (ellipseA * Math.sqrt(1 - ellipseE * ellipseE));
    ellipseCenter = ellipseA * ellipseE;
    orbitSpeed = (ellipseA == 0) ? 0 : (width / 500f) / ellipseA;
  }

  void tick() {
    pathAngleRadians += orbitSpeed * SIM_SPEED;
    pos.set(ellipseCenter + ellipseA * sin(pathAngleRadians), ellipseB * cos(pathAngleRadians));
  }

  void draw(Vec2D pos, color fillColor) {
    noStroke();
    translate(pos.x, pos.y);
    color fadedColor = fillColor;
    for (int i = 1; i < 3; i++) {
      fill(fadedColor);
      ellipse(0, 0, radius + i, radius + i);
      fadedColor = fadeColor(fillColor, .6f, false);
    }
    translate(-pos.x, -pos.y);
  }

  void drawOrbit() {
    noFill();
    strokeWeight(2);
    stroke(FOREGROUND_COLOR);
    ellipse(ellipseCenter, 0, ellipseA, ellipseB);
  }
};

final float AU = 149598000f; // Astronomical Unit, in km
final float SCALE_FACTOR = 2000000000f;  // scale of whole sketch in km
final float SCALE_SUN = 0.017f; // da Sun is big...
final float SCALE_PLANETS = 3200f; // da planets are small...
final float SIM_SPEED = .30;  // controls the speed of all things
final float APPROACHING_DIST = 0.065f;

final int FRAME_SAVE_FREQUENCY = 30;
final int MAX_SAVED_STATES = 10;

final color BACKGROUND_COLOR = color(85, 170, 216);
final color FOREGROUND_COLOR = color(221, 250, 252);
final color PARENT_COLOR = unhex(getBackgroundColor());

Planet sun, earth, mars;

SavedState currState = new SavedState();
SavedState[] pastStates = new SavedState[MAX_SAVED_STATES];

void onSizeChange() {
  if (sun != null && earth != null && mars != null) {
    sun.onSizeChange();
    earth.onSizeChange();
    earth.orbitSpeed *= 1.2; // make orbit speed difference more dramatic
    mars.onSizeChange();
  }
}

void setup() {
  doResize();
  textAlign(CENTER, CENTER);
  ellipseMode(RADIUS);

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

  sun = new Planet('Sun', 700000f * SCALE_SUN, 0, 0, 0);
  earth = new Planet('Earth', 6400f, 1, -0.017, 0);
  mars = new Planet('Mars', 3400f, 1.881, -0.093, 250);
  onSizeChange();
  currState = new SavedState(earth.pos, mars.pos);
}

class SavedState {
  Vec2D earthPos, marsPos;
  color lineColor = FOREGROUND_COLOR;
  color earthColor = color(121, 244, 82);
  color marsColor = color(236, 118, 82);

  SavedState(Vec2D earthPos, Vec2D marsPos) {
    this.earthPos = earthPos;
    this.marsPos = marsPos;
  }

  void fade(float amt) {
    lineColor = fadeColor(lineColor, amt, true);
    earthColor = fadeColor(earthColor, amt, true);
    marsColor = fadeColor(marsColor, amt, true);
  }

  void drawPlanets() {
    earth.draw(earthPos, earthColor);
    mars.draw(marsPos, marsColor);
  }

  void drawOrbits() {
    earth.drawOrbit();
    mars.drawOrbit();
  }

  void drawLineOfSight(int weight) {
    strokeWeight(weight);
    Vec2D l = marsPos.sub(earthPos).scaleInPlace(width / 2);
    stroke(lineColor);
    line(earthPos.x, earthPos.y, l.x, l.y);
  }
};

boolean approaching = false;

void draw() {
  background(PARENT_COLOR);

  pushMatrix();
  translate(width / 2, height / 2);
  fill(BACKGROUND_COLOR);
  ellipse(0, 0, width / 2, height / 2);
  sun.draw(sun.pos, color(254, 210, 73));
  earth.tick();
  mars.tick();

  currState.drawOrbits();
  currState.drawLineOfSight(1);
  currState.drawPlanets();

  for (SavedState pastState : pastStates) {
    if (null != pastState) {
      pastState.drawLineOfSight(3);
      pastState.drawPlanets();
      pastState.fade(.97f);
    }
  }
  popMatrix();

  if (earth.pos.distanceTo(mars.pos) < APPROACHING_DIST * width) {
    if (!approaching) {
      pastStates = new SavedState[MAX_SAVED_STATES];
      approaching = true;
    }
  } else {
    approaching = false;
  }

  if (approaching && frameCount % FRAME_SAVE_FREQUENCY == 0) {
    SavedState savedState = new SavedState(earth.pos.copy(), mars.pos.copy());
    int index = (frameCount / FRAME_SAVE_FREQUENCY) % pastStates.length;
    pastStates[index] = savedState;
  }
}
