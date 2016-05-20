/**
  Author: Karl Hiner
*/

// https://shoffing.wordpress.com/2013/02/22/automatically-scaling-a-processing-js-sketch-to-fit-the-browser-window/comment-page-1/#comment-149
function doResize() {
  var setupWidth = $('#string-pluck-parent').width();

  var setupHeight = setupWidth;
  $('#string-pluck-canvas').height(setupHeight);
  size(setupWidth, setupHeight, P2D);
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
  return rgbToHex($('#string-pluck-parent').css('background-color'));
}


/**********************************************************************
  Pluck the string by holding the mouse down and releasing.
  Adjust the speed, damping, and number of harmonics of the simulation.
  The equation for this simulation is due to:
  http://www.oberlin.edu/faculty/brichard/Apples/StringsPage.html
***********************************************************************/
 
final float PI_SQUARED = PI*PI;
final color PARENT_COLOR = unhex(getBackgroundColor());
final color BACKGROUND_COLOR = color(85, 170, 216);
final color FOREGROUND_COLOR = color(221, 250, 252);

boolean plucked = false;
int t = 0;          // time since pluck
int harmonics = 8; // harmonics - each harmonic requires more computation
float c = 100;      // speed
float amp = 0;      // amplitude
float d;            // x position of pluck
float damp = 1.1;   // damping constant
float[] precomputedHarmonics = new float[harmonics];
float stringHeight;
float hoopCenterX = 0;
float hoopCenterY = 0;
float hoopWidth;
float hoopHeight;
float ballCenterX = 0;
float ballCenterY = 0;
float ballRadius = 0;
float ballVelocity = 0;
float gravity = 0.2;

void onSizeChange() {
  stringHeight = height * .75;
  hoopWidth = width / 5;
  hoopHeight = hoopWidth / 3;
  hoopCenterX = width / 4;
  hoopCenterY = height / 4;
  ballRadius = hoopWidth / 6;
  ballCenterX = width / 2;
  ballCenterY = width / 2;
  precomputeHarmonics();
}

void precomputeHarmonics() {
    for (int i = 0; i < precomputedHarmonics.length; i++) {
    int m = i + 1;
    precomputedHarmonics[i] = (1.0 / (m * m)) * sin((PI_SQUARED * m * d) / width);
  }
}

void setup() {
  doResize();
  strokeWeight(3);
  smooth();
}
 
void draw() {
  background(PARENT_COLOR);
  noStroke();
  fill(BACKGROUND_COLOR);
  rect(0, 0, width, height, width / 20);
  stroke(FOREGROUND_COLOR);

  if (plucked) {
    t++;
    amp /= damp;
  }
  float w = PI * (c / width);
  float yScale = (1.5 * amp * width * width) / (PI_SQUARED * d * (width - d));

  float stringY = 0;

  beginShape();
  if (plucked) {
    int segmentWidth = width / 75;
    for (int x = 0; x < width; x += segmentWidth) {
      float sum = 0;
      for (int m = 1; m <= harmonics; m++) {
        sum += precomputedHarmonics[m - 1] * cos(w * m * t) * sin((PI * m * x) / width);
      }

      float y = yScale * sum + stringHeight;
      if (x > ballCenterX - segmentWidth / 2 || x < ballCenterX + segmentWidth / 2) {
        stringY = y;
      }

      vertex(x, y);
    }
  }
  else {
    vertex(0, stringHeight);
    vertex(d, stringHeight + amp);
    vertex(width, stringHeight);
    stringY = d / 2;
  }
  endShape();

  ellipse(hoopCenterX, hoopCenterY, hoopWidth, hoopHeight);
  ellipse(ballCenterX, ballCenterY, ballRadius * 2, ballRadius * 2);

  float nextBallCenterY = ballCenterY + ballVelocity;
  if (nextBallCenterY + ballRadius < stringY) {
    ballCenterY = nextBallCenterY;
    ballVelocity = ballVelocity + gravity;
  }
}
 
void mousePressed() {
  plucked = false;
  t = 0;
  amp = mouseY - stringHeight;
  d = mouseX;
}
 
void mouseDragged() {
  d = mouseX;
  amp = mouseY - stringHeight;
}
 
void mouseReleased() {
  precomputeHarmonics();
  plucked = true;
}

// void damp(float value) { damp = value; }
// void c(float value) { c = value; }
// void harmonics(float value) { harmonics = (int) value; }
