const table = document.querySelector("#grid");
for (let i = 0; i < 67; i++) {
  const tr = table.insertRow();
  for (let j = 0; j < 67; j++) {
    const td = tr.insertCell();
    td.tabIndex = -1;
    const div = document.createElement("div");

    if ((i + j) % 2 === 0) {
      div.className = "bubble note";
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.innerText = "Hubert Normalman";
      const emphasis = document.createElement("em");
      emphasis.innerText = "The Crazycopter";
      const text = document.createTextNode(", 2023");
      p.appendChild(strong);
      p.appendChild(document.createElement("br"));
      p.appendChild(emphasis);
      p.appendChild(text);
      div.appendChild(p);
      td.appendChild(div)
    } else {
      div.className = "bubble plead";
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.innerText = "Help Grow The Machine";
      const text = document.createTextNode(
        "Reserve this tile and change the face of the factory forever"
        );
      const a = document.createElement("a");
      a.href = "https://www.gooasdsadgle.com"
      a.innerText = "-----> Click Here <-----";
      p.appendChild(strong);
      p.appendChild(document.createElement("br"));
      p.appendChild(text);
      p.appendChild(document.createElement("br"));
      p.appendChild(a);
      div.appendChild(p);
      td.appendChild(div);
    }
  }
}

//https://stackoverflow.com/a/55028818/2994229
let deltaTime = 0;
let lastTimestamp = 0;

function start() {
  requestAnimationFrame(update);
}

function update(timestamp) {
  requestAnimationFrame(update);
  deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  update2(deltaTime);
}

start();

var isMouseDown = false;
var dirty = true;
var clickAvailable = false;
var start = null;
var savedPositions = [];
var xVelocity = 0;
var yVelocity = 0;
var c = 0;
var timeSinceRelease = 0;
var friction = 0.95;
var minSpeed = 0.01;
const TP = 16; // Time Period - stolen from pixi-viewport

window.addEventListener("pointerdown", down);
window.addEventListener("pointermove", move);
window.addEventListener("pointerup", up);
//viewport.addEventListener("pointerout", (e) => { console.log("UP2") ; up(e) });

function down(event) {
  if (event.pointerType === "mouse") {
    console.log("DOWN");
    isMouseDown = true;
    if (xVelocity > 0 || yVelocity > 0) {
      clickAvailable = true;
    }
    start = {
      x: event.offsetX,
      y: event.offsetY,
    };
  }
  event.stopPropagation();
}

function move(event) {
  if (isMouseDown) {
    window.scrollBy(-event.movementX, -event.movementY);
    savedPositions.push({
      x: window.scrollX,
      y: window.scrollY,
      time: performance.now(),
    });
    if (savedPositions.length > 60) {
      savedPositions.splice(0, 30);
    }
    dirty = true;
  }
  if (isMouseDown && clickAvailable && start != null) {
    const distX = event.offsetX - start.x;
    const distY = event.offsetY - start.y;
    if (distX > 5 || distY > 5) {
      clickAvailable = false;
    }
  }
  event.stopPropagation();
}

function up(event) {
  if (event.pointerType === "mouse") {
    if (isMouseDown) {
      console.log("UP");
    }
    isMouseDown = false;
  }

  if (savedPositions.length) {
    const now = performance.now();
    // get the position 100 ms ago, and base the velocity off that
    for (const save of savedPositions) {
      if (save.time >= now - 100) {
        const time = now - save.time;
        xVelocity = (window.scrollX - save.x) / time;
        yVelocity = (window.scrollY - save.y) / time;
        timeSinceRelease = 0;
        break;
      }
    }
  }

  // if (this.clickAvailable) {
  //     this.container.emit('clicked', {
  //         event,
  //         screen: this.start,
  //         world: this.container.toWorld(this.start),
  //         viewport: this
  //     });
  //     this.clickAvailable = false;
  // }

  event.stopPropagation();
}

function update2(elapsed) {
  const ti = timeSinceRelease;
  const tf = timeSinceRelease + elapsed;

  if (xVelocity || yVelocity) {
    xScroll =
      ((xVelocity * TP) / Math.log(friction)) *
      (Math.pow(friction, tf / TP) - Math.pow(friction, ti / TP));
    yScroll =
      ((yVelocity * TP) / Math.log(friction)) *
      (Math.pow(friction, tf / TP) - Math.pow(friction, ti / TP));

    xVelocity *= Math.pow(friction, elapsed / TP);
    yVelocity *= Math.pow(friction, elapsed / TP);

    window.scrollBy(xScroll, yScroll);

    dirty = true;
  }

  timeSinceRelease += elapsed;

  // End decelerate velocity once it goes under a certain amount of precision.
  if (Math.abs(xVelocity) < minSpeed && Math.abs(yVelocity) < minSpeed) {
    xVelocity = 0;
    yVelocity = 0;
  }
}
