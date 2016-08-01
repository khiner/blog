// https://shoffing.wordpress.com/2013/02/22/automatically-scaling-a-processing-js-sketch-to-fit-the-browser-window/comment-page-1/#comment-149
function doResize() {
  var setupWidth = 3 * $('#graphs-parent').width() / 4;
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

function updateMatrixTable() {
  var tableRef = $('#matrix tbody').get(0);
  for (var row = 0; row < network.numElements; row++) {
    var newRow = tableRef.insertRow(tableRef.rows.length);
    for (var col = 0; col < network.numElements; col++) {
      var newCell = newRow.insertCell(newRow.length);
      var newText  = document.createTextNode(network.weights[row][col]);
      newCell.appendChild(newText);
    }
  }
}

Network network;
Toggle imageToggle, edgesToggle, verticesToggle;
Toggle[] toggles;

float halfWidth, halfHeight;
float backgroundColor = unhex(getBackgroundColor());

PImage img = loadImage("/assets/mario.jpg");
float[] imagePixels;

void setup() {
  network = new Network(5);
  doResize();
  updateMatrixTable();
  float toggleDim = height / 40, toggleOffset = 5;;
  imageToggle = new Toggle(width - 200, 0, toggleDim, toggleDim, "Image").enabled(true);
  edgesToggle = new Toggle(width - 200, toggleDim + toggleOffset, toggleDim, toggleDim, "Edges").enabled(true);
  verticesToggle = new Toggle(width - 200, (toggleDim + toggleOffset) * 2, toggleDim, toggleDim, "Vertices").enabled(true);
  pauseToggle = new Toggle(width - 400, 0, toggleDim, toggleDim, "Pause").enabled(false);
  toggles = new Toggle[] {imageToggle, edgesToggle, verticesToggle, pauseToggle};
}

void draw() {
  background(backgroundColor);
  if (!pauseToggle.enabled) {
    network.step();
  }
  network.draw();
  for (Toggle toggle : toggles) {
    toggle.draw();
  }

  if (imagePixels == null && img.loaded) {
    img.loadPixels();
    imagePixels = copyFloatArray(img.pixels);
    network.onSizeChange();
  }
}

void mousePressed() {
  for (Toggle toggle : toggles) {
    toggle.mousePressed();
  }
}

void mouseReleased() {
  for (Toggle toggle : toggles) {
    toggle.mouseReleased();
  }
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
    pushMatrix();
    translate(halfWidth - viewCenter[0], halfHeight - viewCenter[1]);

    if (imageToggle.enabled) {
      float w = img.width / dim, h = img.height / dim;
      if (imagePixels != null) {
        for (int col = 0; col < dim - 1; col++) {
          for (int row = 0; row < dim - 1; row++) {
            int i = row * dim + col;
            image(img.get(col * w, row * h, w, h), positions[i][0], positions[i][1], positions[i + 1][0] - positions[i][0] + 1, positions[i + dim][1] - positions[i][1] + 1);
          }
        }
      }
    }

    for (int i = 0; i < numElements; i++) {
      stroke(0);
      if (edgesToggle.enabled) {
        for (int j = i; j < numElements; j++) {
          if (weights[i][j] > 0) {
            line(positions[i][0], positions[i][1], positions[j][0], positions[j][1]);
          }
        }
      }

      if (verticesToggle.enabled) {
        fill(0);
        noStroke();
        ellipse(positions[i][0], positions[i][1], 10, 10);
      }
    }
    popMatrix();
  }
}

class Button {
  boolean pressed = false;
  float x, y, w, h;

  float neutralColor = 200, hoverColor = 0, pressedColor = color(85, 170, 216);

  String label;

  Button(float x, float y, float w, float h, String label) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
  }

  void draw() {
    fill(getColor());
    rect(x, y, w, h);
    textSize(h);
    text(label, x + w + 5, y + h);
  }

  float getColor() {
    return pressed ? pressedColor : (hovering() ? hoverColor : neutralColor);
  }

  boolean hovering() {
    return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
  }

  void mousePressed() {
    if (hovering())
      pressed = true;
  }

  void mouseReleased() {
    pressed = false;
  }
}

class Toggle extends Button {
  boolean enabled = false;

  Toggle(float x, float y, float w, float h, String label) {
    super(x, y, w, h, label);
  }

  Toggle enabled(boolean enabled) {
    this.enabled = enabled;
    return this;
  }

  void mousePressed() {
  }

  void mouseReleased() {
    if (hovering())
      enabled = !enabled;
  }

  float getColor() {
    return hovering() ? hoverColor : (enabled ? pressedColor : neutralColor);
  }
}
