/**
  Author: Karl Hiner
*/

// https://shoffing.wordpress.com/2013/02/22/automatically-scaling-a-processing-js-sketch-to-fit-the-browser-window/comment-page-1/#comment-149
function doResize() {
  var setupWidth = $('#retrograde-parent').width();

  var setupHeight = setupWidth;
  $('#pjs').height(setupHeight);
  size(setupWidth, setupHeight);
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
  return rgbToHex($('#retrograde-parent').css('background-color'));
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

  float magnitude() {
    return sqrt((x * x) + (y * y));
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
  float radius;
  float ellipseA;
  float ellipseE;
  float ellipseB;
  float ellipseCenter;
  float orbitSpeed;
  float pathAngleRadians;
  Vec2D pos;

  Planet(String name, float radius, float ellipseA, float ellipseE) {
    this.name = name;
    this.radius = map(radius, 0, SCALE_FACTOR, 0, width / 2);
    this.ellipseA = map(ellipseA * AU, 0, SCALE_FACTOR, 0, width / 2);
    this.ellipseE = ellipseE;
    ellipseB = (float) (this.ellipseA * Math.sqrt(1 - ellipseE * ellipseE));
    ellipseCenter = this.ellipseA * ellipseE;
    orbitSpeed= (ellipseA == 0) ? 0 : 1.0 / ellipseA;

    pathAngleRadians = radians(45);

    pos = new Vec2D(0, 0);
  }

  void tick() {
    pathAngleRadians += orbitSpeed * SIM_SPEED;
    pos.set(ellipseCenter + ellipseA * sin(pathAngleRadians), ellipseB * cos(pathAngleRadians));
  }

  void draw(Vec2D pos, color fillColor) {
    noStroke();
    fill(fillColor);
    translate(pos.x, pos.y);
    ellipse(0, 0, radius * 3000, radius * 3000);
    translate(-pos.x, -pos.y);
  }

  void drawOrbit() {
    noFill();
    strokeWeight(2);
    stroke(FOREGROUND_COLOR);
    ellipse(ellipseCenter, 0, ellipseA, ellipseB);
  }
};

final int AU = 149598000; // Astronomical Unit, in km
final int SCALE_FACTOR = 2500000000;  // for scale factor, use roughtly the distance of farthest planet
final int FRAME_SAVE_FREQUENCY = 30;
final float SIM_SPEED = .02;  // controls the speed of all things
final color BACKGROUND_COLOR = color(85, 170, 216);
final color FOREGROUND_COLOR = color(221, 250, 252);
final color PARENT_COLOR = unhex(getBackgroundColor());
Planet sun, earth, mars;

SavedState currState = new SavedState();
SavedState[] pastStates = new SavedState[5];

void setup() {
  doResize();
  textAlign(CENTER, CENTER);
  ellipseMode(RADIUS);

  float sunScale = 0.02f; // da Sun is big...


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

  sun = new Planet('Sun', 700000f * sunScale, 0, 0);
  earth = new Planet('Earth', 6400f, 1, -0.017);
  mars = new Planet('Mars', 3400f, 1.881, -0.093);

  currState = new SavedState(earth.pos, mars.pos, FOREGROUND_COLOR);
}

class SavedState {
  Vec2D earthPos, marsPos;
  color c, earthC, marsC;

  SavedState(Vec2D earthPos, Vec2D marsPos, color c) {
    this.earthPos = earthPos;
    this.marsPos = marsPos;
    this.c = c;
    earthC = color(10, 245, 10);
    marsC = color(245, 10, 10);
  }

  void dim() {
    c = dim(c);
    earthC = dim(earthC);
    marsC = dim(marsC);
  }

  color dim(color c) {
    return color(red(c), green(c), blue(c), alpha(c) - 4);
  }

  void tick() {
    earth.tick();
    mars.tick();
  }

  void drawPlanets() {
    earth.draw(earthPos, earthC);
    mars.draw(marsPos, marsC);
  }

  void drawOrbits() {
    earth.drawOrbit();
    mars.drawOrbit();
  }

  void drawLineOfSight() {
    strokeWeight(2);
    Vec2D l = marsPos.sub(earthPos).scaleInPlace(50);
    stroke(c);
    line(earthPos.x, earthPos.y, l.x, l.y);
  }
};

void draw() {
  background(PARENT_COLOR);

  pushMatrix();
  translate(width / 2, height / 2);
  fill(BACKGROUND_COLOR);
  ellipse(0, 0, width / 2, height / 2);
  sun.draw(sun.pos, FOREGROUND_COLOR);

  currState.tick();
  currState.drawOrbits();
//  currState.drawLineOfSight();
  currState.drawPlanets();

  SavedState savedState = new SavedState(earth.pos.copy(), mars.pos.copy(), FOREGROUND_COLOR);

  for (SavedState pastState : pastStates) {
    if (null != pastState) {
      pastState.dim();
      pastState.drawLineOfSight();
      pastState.drawPlanets();
    }
  }
  popMatrix();

  if (frameCount % FRAME_SAVE_FREQUENCY == 0 &&
        earth.pos.sub(mars.pos).magnitude() < 50) {
    int index = (frameCount / FRAME_SAVE_FREQUENCY) % pastStates.length;
    pastStates[index] = savedState;
  }
}
