// https://shoffing.wordpress.com/2013/02/22/automatically-scaling-a-processing-js-sketch-to-fit-the-browser-window/comment-page-1/#comment-149
function doResize() {
  var setupWidth = $('#graphs-parent').width();

  var setupHeight = setupWidth;
  $('#graphs-canvas').height(setupHeight);
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
  return rgbToHex($('#graphs-parent').css('background-color'));
}

// video stuff
var video = $('#videoOutput').get(0);
var getUserMedia = function(t, onsuccess, onerror) {
  if (navigator.getUserMedia) {
    return navigator.getUserMedia(t, onsuccess, onerror);
  } else if (navigator.webkitGetUserMedia) {
    return navigator.webkitGetUserMedia(t, onsuccess, onerror);
  } else if (navigator.mozGetUserMedia) {
    return navigator.mozGetUserMedia(t, onsuccess, onerror);
  } else if (navigator.msGetUserMedia) {
    return navigator.msGetUserMedia(t, onsuccess, onerror);
  } else {
    onerror(new Error("No getUserMedia implementation found."));
  }
};

var URL = window.URL || window.webkitURL;
var createObjectURL = URL.createObjectURL || webkitURL.createObjectURL;
if (!createObjectURL) {
  throw new Error("URL.createObjectURL not found.");
}

getUserMedia({audio:false, video:true},
  function(stream) {
    var url = createObjectURL(stream);
    video.src = url;
  },
  function(error) {
    alert("Couldn’t access webcam.");
  }
);


Network network;

void setup() {
  network = new Network(5 * 5);
  doResize();
  stroke(0);
  fill(0);
  smooth();
}

void draw() {
  background(unhex(getBackgroundColor()));
  network.step();
  network.draw();

  pushMatrix();
  translate(width,0);
  scale(-1,1);//mirror the video
  externals.context.drawImage(video, 0, 0, width, height); //video is defined inside getUserMedia.js
  popMatrix();
}

void mousePressed() {
}

void mouseReleased() {
}

void onSizeChange() {
  network.onSizeChange();
}


class Network {
  float dimensions = 2;
  float dim;
  float numElements;
  float[][] weights;
  float[][] positions;
  float[][] velocities;

  float k = 0.00006f;

  float randomOffset = 0;

  float[] viewCenter = new float[] {0, 0};

  Network(int numElements) {
    this.numElements = numElements;
    this.weights = new float[numElements][numElements];
    this.positions = new float[numElements][dimensions];
    this.velocities = new float[numElements][dimensions];

    this.dim = (int) sqrt(numElements);
    for (int row = 0; row < dim; row++) {
      for (int col = 0; col < dim; col++) {
        if (row > 0) {
          setWeight(row, col, row - 1, col, 0.1);
        }
        if (row < dim - 1) {
          setWeight(row, col, row + 1, col, 0.1);
        }
        if (col > 0) {
          setWeight(row, col, row, col - 1, 0.1);
        }
        if (col < dim - 1) {
          setWeight(row, col, row, col + 1, 0.1);
        }
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
          float forceX = -(weights[i][j] - (positions[j][0] - positions[i][0])) * k;
          float forceY = -(weights[i][j] - (positions[j][1] - positions[i][1])) * k;

          velocities[i][0] += forceX;
          velocities[i][1] += forceY;
        }

        //positions[i][0] += velocities[i][0];
        //positions[i][1] += velocities[i][1];
      }
    }

    for (int i = 0; i < numElements; i++) {
      for (int j = 0; j < numElements; j++) {
        positions[i][0] += velocities[i][0];
        positions[i][1] += velocities[i][1];
      }
    }

    viewCenter[0] = positions[(int) (numElements / 2.0)][0] - width / 2;
    viewCenter[1] = positions[(int) (numElements / 2.0)][1] - height / 2;
  }

  void draw() {
    translate(-viewCenter[0], -viewCenter[1]);
    for (int i = 0; i < numElements; i++) {
      ellipse(positions[i][0], positions[i][1], 10, 10);
      for (int j = i; j < numElements; j++) {
        if (weights[i][j] > 0) {
          line(positions[i][0], positions[i][1], positions[j][0], positions[j][1]);
        }
      }
    }
  }
}
