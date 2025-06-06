let boxW = 600, boxH = 180;
let W = 1600, H = 900;

let boxX, boxY;
let btnW = 100, btnH = 35;
let btnX, btnY;
let PULL_THRESHOLD = 120;
let handleRadius = 22;
let draggingWire = -1;
let correctWireIndex = 1;
let isStarted = false;
let isPlaying = false;

let wires = [];
let audio1;

function preload() {
  //replace "audio_2.mp3" with your actual file if different
  soundFormats('mp3', 'ogg');
  audio1 = loadSound('audio_2.mp3');
}

function setup() {
  createCanvas(W, H);
  boxX = (W - boxW) / 2;
  boxY = 240;

  btnX = W/2 - btnW/2;
  btnY = H - btnH - 30;

  let spacing = boxH / 5.0;
  //left wires
  wires[0] = new Wire(0, boxY + spacing * 1, boxX, boxY + spacing * 1, "left");
  wires[1] = new Wire(0, boxY + spacing * 4, boxX, boxY + spacing * 4, "left");
  //right wires
  wires[2] = new Wire(W, boxY + spacing * 1, boxX + boxW, boxY + spacing * 1, "right");
  wires[3] = new Wire(W, boxY + spacing * 4, boxX + boxW, boxY + spacing * 4, "right");
}

function draw() {
  background(30, 32, 35);

  //draw the power box
  stroke(75, 40, 20);
  strokeWeight(8);
  fill(138, 86, 43);
  rect(boxX, boxY, boxW, boxH);

  //draw wires
  for (let w of wires) {
    w.render();
  }

  //draw start button (very low and small)
  if (isStarted) {
    fill(60);
    stroke(80);
  } else {
    fill(70);
    stroke(120);
  }
  strokeWeight(2);
  rect(btnX, btnY, btnW, btnH, 7);

  fill(180);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  if (isStarted && isPlaying) {
    text("Playing...", btnX + btnW/2, btnY + btnH/2);
  } else if (isStarted && !isPlaying) {
    text("Stopped", btnX + btnW/2, btnY + btnH/2);
  } else {
    text("Start", btnX + btnW/2, btnY + btnH/2);
  }
}

function mousePressed() {
  //start button
  if (!isStarted && overRect(btnX, btnY, btnW, btnH)) {
    correctWireIndex = floor(random(wires.length));//randomize correct wire
    for (let w of wires) w.reconnect();
    audio1.stop();
    audio1.play();
    isPlaying = true;
    isStarted = true;
    return;
  }
  //wire handle
  if (isStarted && isPlaying) {
    for (let i = 0; i < wires.length; i++) {
      if (wires[i].isMouseOverHandle(mouseX, mouseY)) {
        wires[i].dragging = true;
        draggingWire = i;
        break;
      }
    }
  }
}

function mouseDragged() {
  if (draggingWire != -1) {
    wires[draggingWire].dragHandle(mouseX, mouseY);
  }
}

function mouseReleased() {
  if (draggingWire != -1) {
    let w = wires[draggingWire];
    if (w.pulledOutAmount() >= PULL_THRESHOLD && !w.disconnected) {
      w.disconnect();
      if (draggingWire == correctWireIndex && isPlaying) {
        audio1.stop();
        isPlaying = false;
      }
    }
    w.dragging = false;
    draggingWire = -1;
    if (!w.disconnected) w.snapBackIfNotPulledEnough();
  }
}

function overRect(x, y, w, h) {
  return mouseX >= x && mouseX <= x+w && mouseY >= y && mouseY <= y+h;
}

//------ Wire class -------
class Wire {
  constructor(sx, sy, bx, by, side) {
    this.startX = sx;
    this.startY = sy;
    this.boxX = bx;
    this.boxY = by;
    this.side = side;
    this.handleRadius = handleRadius;
    this.dragging = false;
    this.disconnected = false;
    this.pulledX = this.boxX;
    this.pulledY = this.boxY;
  }

  render() {
    stroke(130,130,130);
    strokeWeight(10);
    if (this.disconnected) {
      line(this.startX, this.startY, this.pulledX, this.pulledY);
      strokeWeight(14);
      stroke(40, 20, 10, 70);
      point(this.boxX, this.boxY);
    } else {
      line(this.startX, this.startY, this.boxX, this.boxY);
    }

    if (!this.disconnected) {
      if (this.dragging) fill(240, 120, 120);
      else fill(220, 50, 50);
      noStroke();
      ellipse(this.boxX, this.boxY, this.handleRadius * 2, this.handleRadius * 2);
    } else {
      fill(70, 20, 20);
      noStroke();
      ellipse(this.pulledX, this.pulledY, this.handleRadius * 2, this.handleRadius * 2);
    }
  }

  isMouseOverHandle(mx, my) {
    if (this.disconnected) return false;
    let d = dist(mx, my, this.boxX, this.boxY);
    return (d <= this.handleRadius + 2);
  }

  dragHandle(mx, my) {
    //only allow pulling away from box horizontally
    if (this.side == "left") {
      this.boxX = constrain(mx, this.boxX - 220, this.boxX);
      this.boxY = this.startY;
    } else {
      this.boxX = constrain(mx, this.boxX, this.boxX + 220);
      this.boxY = this.startY;
    }
  }

  pulledOutAmount() {
    return abs(this.boxX - this.startX);
  }

  disconnect() {
    this.disconnected = true;
    this.pulledX = this.boxX;
    this.pulledY = this.boxY;
  }

  snapBackIfNotPulledEnough() {
    this.boxX = (this.side == "left") ? ((W - boxW)/2) : ((W + boxW)/2);
    this.boxY = this.startY;
  }

  reconnect() {
    this.disconnected = false;
    this.boxX = (this.side == "left") ? ((W - boxW)/2) : ((W + boxW)/2);
    this.boxY = this.startY;
  }
}
