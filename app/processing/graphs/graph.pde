// https://shoffing.wordpress.com/2013/02/22/automatically-scaling-a-processing-js-sketch-to-fit-the-browser-window/comment-page-1/#comment-149
function doResize() {
  var setupWidth = $('#graphs-parent').width();
  var setupHeight = setupWidth;
  $('#graphs-canvas').height(setupHeight);
  size(setupWidth, setupHeight);
  halfWidth = width / 2;
  halfHeight = height / 2;
  network.onSizeChange();
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
  return rgbToHex($('#graphs-parent').css('background-color'));
}

Network network;
float halfWidth, halfHeight;
float backgroundColor = unhex(getBackgroundColor());

PImage img = loadImage("/assets/mario.jpg");
float[] imagePixels;

void setup() {
  network = new Network(5);
  doResize();
}

void draw() {
  background(backgroundColor);
  network.step();
  network.draw();

  if (imagePixels == null && img.loaded) {
    img.loadPixels();
    imagePixels = copyFloatArray(img.pixels);
    network.onSizeChange();
  }
}

void mousePressed() {
}

void mouseReleased() {
}

float[] copyFloatArray(float[] floatArray) {
  float[] floatArrayCopy = new float[floatArray.length];
  for (int i = 0; i < floatArray.length; i++)
    floatArrayCopy[i] = floatArray[i];
  return floatArrayCopy;
}

class Network {
  int dimensions = 2;
  float k = 0.00006f;
  float randomOffset = 0;
  float[] viewCenter = new float[] {0, 0};

  int dim, numElements;
  float[][] weights;
  float[][] positions;
  float[][] velocities;

  Network(int dim) {
    this.dim = dim;
    this.numElements = dim * dim;
    this.weights = new float[numElements][numElements];
    this.positions = new float[numElements][dimensions];
    this.velocities = new float[numElements][dimensions];
    this.viewCenter = positions[floor(numElements / 2.0)];

    for (int row = 0; row < dim; row++) {
      for (int col = 0; col < dim; col++) {
        if (row > 0)
          setWeight(row, col, row - 1, col, 1);
        if (row < dim - 1)
          setWeight(row, col, row + 1, col, 1);
        if (col > 0)
          setWeight(row, col, row, col - 1, 1);
        if (col < dim - 1)
          setWeight(row, col, row, col + 1, 1);
      }
    }
  }

  void onSizeChange() {
    for (int i = 0; i < numElements; i++) {
      int row = (int) (i / dim);
      int col = i % dim;
      positions[i][0] = width * ((float) col / dim) + random(-randomOffset, randomOffset);
      positions[i][1] = height * ((float) row / dim) + random(-randomOffset, randomOffset);
    }
  }

  float setWeight(int row, int col, int otherRow, int otherCol, float weight) {
    weights[row * dim + col][otherRow * dim + otherCol] = weight;
  }

  void step() {
    for (int i = 0; i < numElements; i++) {
      for (int j = 0; j < numElements; j++) {
        if (weights[i][j] > 0) {
          for (int d = 0; d < dimensions; d++) {
            velocities[i][d] += (positions[j][d] - positions[i][d] - weights[i][j]) * k;
          }
        }

//        positions[i][0] += velocities[i][0];
//        positions[i][1] += velocities[i][1];
      }
    }

    for (int i = 0; i < numElements; i++) {
      for (int j = 0; j < numElements; j++) {
        for (int d = 0; d < dimensions; d++) {
          positions[i][d] += velocities[i][d];
        }
      }
    }
  }

  void draw() {
    translate(halfWidth - viewCenter[0], halfHeight - viewCenter[1]);
    float w = img.width / dim, h = img.height / dim;

    if (imagePixels != null) {
      for (int col = 0; col < dim - 1; col++) {
        for (int row = 0; row < dim - 1; row++) {
          int i = row * dim + col;
          image(img.get(col * w, row * h, w, h), positions[i][0], positions[i][1], positions[i + 1][0] - positions[i][0] + 1, positions[i + dim][1] - positions[i][1] + 1);
        }
      }
    }

    for (int i = 0; i < numElements; i++) {
      stroke(0);
      for (int j = i; j < numElements; j++) {
        if (weights[i][j] > 0) {
          line(positions[i][0], positions[i][1], positions[j][0], positions[j][1]);
        }
      }

      fill(0);
      noStroke();
      ellipse(positions[i][0], positions[i][1], 10, 10);
    }
  }
}
