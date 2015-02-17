// https://shoffing.wordpress.com/2013/02/22/automatically-scaling-a-processing-js-sketch-to-fit-the-browser-window/comment-page-1/#comment-149

/* @pjs preload="/assets/cityscape.jpg"; */

function doResize() {
  var setupWidth = $('#snow-globe-parent').width();

  var setupHeight = setupWidth * imageRatio;
  $('#snow-globe-canvas').height(setupHeight);
  size(setupWidth, setupHeight);
  onSizeChange();
}
$(window).resize(doResize);

void onSizeChange() {
  img.resize(width, height);
  canny.setImg(img);
  edges = canny.process();
  myPixels = new int[width * height];
  for (int i = 0; i < width * height; ++i) {
    myPixels[i] = color(BACKGROUND_COLOR);
  }
}

final color BACKGROUND_COLOR = color(85, 170, 216);
final color FOREGROUND_COLOR = color(221, 250, 252);
CannyEdgeDetector canny = new CannyEdgeDetector();

boolean showImage = true;

PImage img;
int[] edges;
int[] myPixels;
int snowRate = 6;
float imageRatio;

void setup() {
  img = loadImage("/assets/cityscape.jpg", "jpg");
  imageRatio = img.height / img.width;
  doResize();
}
 
void draw() {
  if (img != null && img.loaded && showImage) {
    image(img, 0, 0);
  } else {
    background(BACKGROUND_COLOR);
    snow();
    if (mousePressed) {
      mouseSnow();
    }
    shake();
    loadPixels();
    for (int i = 0; i < width*height; ++i) {
      pixels[i] = myPixels[i];
    }
    updatePixels();
  }
}
 
// Call this method to show the original edge map
void displayEdges() {
  for (int i = 0; i < width * height; ++i) {
    set(i % width, i / width, edges[i]);
  }
}
 
// Drop snow from the top of the frame
void snow() {
  for (int i = 0; i < snowRate; i++) {
    myPixels[(int) random(0, width)] = color(FOREGROUND_COLOR);
  }
}
 
// The mouse shoots out snow when held down.
// Drop three 'snowflakes': one on the clicked pixel, one to the left, and one to the right
void mouseSnow() {
  if (mouseX > 0 && mouseX < width - 1 && mouseY > 0 && mouseY < height - 1) {
    int clickedPix = mouseX + mouseY * width;
    for (int i = clickedPix - 1; i <= clickedPix + 1; i++) {
      myPixels[i] = color(FOREGROUND_COLOR);
    }
  }
}
 
// Move those white pixels!
void shake() {
  for (int x = 0; x < width; x++) {
    for (int y = 0; y < height; y++) {
      int pixel = y * width + x;
      // once an edge is colored white, it is locked, so ignore these pixels, and all empty ones
      if (myPixels[pixel] == color(BACKGROUND_COLOR) || edges[pixel] == color(FOREGROUND_COLOR))
        continue;
      int newY = y + (int) random(0, 2);
      int newX = x + (int) random(-2, 2);
      if (newY < 0)
        newY = 0;
      else if (newY >= height)
        newY = height - 1;

      if (newX < 0)
        newX = 0;
      else if (newX >= width)
        newX = width - 1;

      int newPixel = newY * width + newX;
      // if the new space is empty, move the white pixel to a new location
      if (myPixels[newPixel] == color(BACKGROUND_COLOR)) {
        myPixels[newPixel] = color(FOREGROUND_COLOR);
        myPixels[pixel] = color(BACKGROUND_COLOR);
      }
    }
  }
}
 
void keyPressed() {
  if (keyCode == UP && snowRate < 40) snowRate++;
  else if (keyCode == DOWN && snowRate > 0) snowRate--;
  else if (keyCode == ' ') showImage = !showImage;
}
 
void mouseClicked() {
  showImage = false;
}


/**
 * This implementation of Canny Edge Detection is stripped down and
 * adapted from Tom Gibara's implementation at:
 * http://www.tomgibara.com/computer-vision/CannyEdgeDetector.java
**/

class CannyEdgeDetector {
  float GAUSSIAN_CUT_OFF = 0.005f;
  float MAGNITUDE_SCALE = 100F;
  float MAGNITUDE_LIMIT = 1000F;
  int MAGNITUDE_MAX = (int) (MAGNITUDE_SCALE * MAGNITUDE_LIMIT);
 
  int[] data;
  int[] magnitude;
  PImage img;
 
  float gaussianKernelRadius;
  float lowThreshold;
  float highThreshold;
  int gaussianKernelWidth;
 
  float[] xConv;
  float[] yConv;
  float[] xGradient;
  float[] yGradient;


  CannyEdgeDetector() {
    lowThreshold = 2.5f;
    highThreshold = 7.5f;
    gaussianKernelRadius = 2f;
    gaussianKernelWidth = 16;
  }
 
  void setImg(PImage img) {
    this.img = img;
  }
 
  int[] process() {
    initArrays();
    readLuminance();
    computeGradients(gaussianKernelRadius, gaussianKernelWidth);
    int low = round(lowThreshold * MAGNITUDE_SCALE);
    int high = round(highThreshold * MAGNITUDE_SCALE);
    performHysteresis(low, high);
    thresholdEdges();
    return data;
  }
 
  void initArrays() {
    if (data == null && img != null) {
      int size = img.width * img.height;
      data = new int[size];
      magnitude = new int[size];
 
      xConv = new float[size];
      yConv = new float[size];
      xGradient = new float[size];
      yGradient = new float[size];
    }
  }
 
  void computeGradients(float kernelRadius, int kernelWidth) {
    //generate the gaussian convolution masks
    float kernel[] = new float[kernelWidth];
    float diffKernel[] = new float[kernelWidth];
    int kwidth;
    for (kwidth = 0; kwidth < kernelWidth; kwidth++) {
      float g1 = gaussian(kwidth, kernelRadius);
      if (g1 <= GAUSSIAN_CUT_OFF && kwidth >= 2) break;
      float g2 = gaussian(kwidth - 0.5f, kernelRadius);
      float g3 = gaussian(kwidth + 0.5f, kernelRadius);
      kernel[kwidth] = (g1 + g2 + g3) / 3f / (TWO_PI * kernelRadius * kernelRadius);
      diffKernel[kwidth] = g3 - g2;
    }
 
    int initX = kwidth - 1;
    int maxX = img.width - kwidth - 1;
    int initY = img.width * (kwidth - 1);
    int maxY = img.width * (img.height - kwidth - 1);
 
    //perform convolution in x and y directions
    for (int x = initX; x < maxX; x++) {
      for (int y = initY; y < maxY; y += img.width) {
        int index = x + y;
        float sumX = data[index] * kernel[0];
        float sumY = sumX;
        for (int xOffset = 1, yOffset = img.width; xOffset < kwidth; xOffset++, yOffset += img.width) {
          sumY += kernel[xOffset] * (data[index - yOffset] + data[index + yOffset]);
          sumX += kernel[xOffset] * (data[index - xOffset] + data[index + xOffset]);
        }
 
        yConv[index] = sumY;
        xConv[index] = sumX;
      }
    }
 
    for (int x = initX; x < maxX; x++) {
      for (int y = initY; y < maxY; y += img.width) {
        float sum = 0f;
        int index = x + y;
        for (int i = 1; i < kwidth; i++) {
          sum += diffKernel[i] * (yConv[index - i] - yConv[index + i]);
        }

        xGradient[index] = sum;
      }
    }
 
    for (int x = kwidth; x < img.width - kwidth; x++) {
      for (int y = initY; y < maxY; y += img.width) {
        float sum = 0.0f;
        int index = x + y;
        int yOffset = img.width;
        for (int i = 1; i < kwidth; i++) {
          sum += diffKernel[i] * (xConv[index - yOffset] - xConv[index + yOffset]);
          yOffset += img.width;
        }
 
        yGradient[index] = sum;
      }
    }
 
    initX = kwidth;
    maxX = img.width - kwidth;
    initY = img.width * kwidth;
    maxY = img.width * (img.height - kwidth);
    for (int x = initX; x < maxX; x++) {
      for (int y = initY; y < maxY; y += img.width) {
        int index = x + y;
        int indexN = index - img.width;
        int indexS = index + img.width;
        int indexW = index - 1;
        int indexE = index + 1;
        int indexNW = indexN - 1;
        int indexNE = indexN + 1;
        int indexSW = indexS - 1;
        int indexSE = indexS + 1;
 
        float xGrad = xGradient[index];
        float yGrad = yGradient[index];
        float gradMag = hypot(xGrad, yGrad);
 
        //perform non-maximal supression
        float nMag = hypot(xGradient[indexN], yGradient[indexN]);
        float sMag = hypot(xGradient[indexS], yGradient[indexS]);
        float wMag = hypot(xGradient[indexW], yGradient[indexW]);
        float eMag = hypot(xGradient[indexE], yGradient[indexE]);
        float neMag = hypot(xGradient[indexNE], yGradient[indexNE]);
        float seMag = hypot(xGradient[indexSE], yGradient[indexSE]);
        float swMag = hypot(xGradient[indexSW], yGradient[indexSW]);
        float nwMag = hypot(xGradient[indexNW], yGradient[indexNW]);
        float tmp;

        if (xGrad * yGrad <= 0.0 /*(1)*/
        ? abs(xGrad) >= abs(yGrad) /*(2)*/
          ? (tmp = abs(xGrad * gradMag)) >= abs(yGrad * neMag - (xGrad + yGrad) * eMag) /*(3)*/
          && tmp > abs(yGrad * swMag - (xGrad + yGrad) * wMag) /*(4)*/
          : (tmp = abs(yGrad * gradMag)) >= abs(xGrad * neMag - (yGrad + xGrad) * nMag) /*(3)*/
          && tmp > abs(xGrad * swMag - (yGrad + xGrad) * sMag) /*(4)*/
:
          abs(xGrad) >= abs(yGrad) /*(2)*/
          ? (tmp = abs(xGrad * gradMag)) >= abs(yGrad * seMag + (xGrad - yGrad) * eMag) /*(3)*/
          && tmp > abs(yGrad * nwMag + (xGrad - yGrad) * wMag) /*(4)*/
          : (tmp = abs(yGrad * gradMag)) >= abs(xGrad * seMag + (yGrad - xGrad) * sMag) /*(3)*/
          && tmp > abs(xGrad * nwMag + (yGrad - xGrad) * nMag) /*(4)*/
          ) {
          magnitude[index] = gradMag >= MAGNITUDE_LIMIT ? MAGNITUDE_MAX : (int) (MAGNITUDE_SCALE * gradMag);
          //NOTE: The orientation of the edge is not employed by this
          //implementation. It is a simple matter to compute it at
          //this point as: Math.atan2(yGrad, xGrad);
        }
        else {
          magnitude[index] = 0;
        }
      }
    }
  }
 
  //NOTE: The hypot approximation Math.abs(x) + Math.abs(y) makes
  //the detection complete ~3-4 times faster, and works just fine.
  float hypot(float x, float y) {
    //return (float) Math.hypot(x, y);
    return abs(x) + abs(y);
  }
 
  float gaussian(float x, float sigma) {
    return exp(-(x * x) / (2f * sigma * sigma));
  }
 
  void performHysteresis(int low, int high) {
    //NOTE: this implementation reuses the data array to store both
    //luminance data from the image, and edge intensity from the processing.
    //This is done for memory efficiency, other implementations may wish
    //to separate these functions.
    for (int i = 0; i < data.length; i++) {
      data[i] = 0;
    }

    int offset = 0;
    for (int y = 0; y < img.height; y++) {
      for (int x = 0; x < img.width; x++) {
        if (data[offset] == 0 && magnitude[offset] >= high) {
          follow(x, y, offset, low);
        }
        offset++;
      }
    }
  }
 
  void follow(int x1, int y1, int i1, int threshold) {
    int x0 = x1 == 0 ? x1 : x1 - 1;
    int x2 = x1 == img.width - 1 ? x1 : x1 + 1;
    int y0 = y1 == 0 ? y1 : y1 - 1;
    int y2 = y1 == img.height -1 ? y1 : y1 + 1;
 
    data[i1] = magnitude[i1];
    for (int x = x0; x <= x2; x++) {
      for (int y = y0; y <= y2; y++) {
        int i2 = x + y * img.width;
        if ((y != y1 || x != x1) && data[i2] == 0 && magnitude[i2] >= threshold) {
          follow(x, y, i2, threshold);
          return;
        }
      }
    }
  }
 
  void thresholdEdges() {
    for (int i = 0; i < data.length; i++) {
      data[i] = data[i] > 0 ? color(FOREGROUND_COLOR) : color(BACKGROUND_COLOR);
    }
  }
 
  int luminance(float r, float g, float b) {
    return round(0.299f * r + 0.587f * g + 0.114f * b);
  }
 
  void readLuminance() {
    for (int i = 0; i < img.width*img.height; i++) {
      int p = img.pixels[i];
      int r = (p & 0xff0000) >> 16;
      int g = (p & 0xff00) >> 8;
      int b = p & 0xff;
      data[i] = luminance(r, g, b);
    }
  }
};
