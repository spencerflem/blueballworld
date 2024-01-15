// credits: pixi-viewport, 98.cc

// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden#the_hidden_until_found_state
// use ^ instead of Focus
//https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-selected
// or https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded
// maybe https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
//https://www.accessibility-developer-guide.com/examples/widgets/tooltips/
//https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/data-grids/

// TODO: ON FOCUS, SET TAB-INDEX OF NEW SPOT TO 0, OTHERS TO -1

const table = document.querySelector("#grid");

//https://stackoverflow.com/a/55028818/2994229
let deltaTime = 0;
let lastTimestamp = 0;

function startRequests() {
  requestAnimationFrame(update);
}

function update(timestamp) {
  requestAnimationFrame(update);
  deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  update2(deltaTime);
} // stop calling when movement is done !!!

startRequests();

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
viewport.addEventListener("pointerupoutside", up);
viewport.addEventListener("pointercancel", up);

function down(event) {
  console.log(event)
  if (event.pointerType === "mouse") {
    isMouseDown = true;
    start = {
      x: event.offsetX,
      y: event.offsetY,
    };
    if (event.target.closest("#viewport") && event.target.closest(".bubble") == null) {
      event.preventDefault();
      event.stopPropagation();
      clickAvailable = true;
    }
  }
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
    const distX = Math.abs(event.offsetX - start.x);
    const distY = Math.abs(event.offsetY - start.y);
    console.log(`BROK! x:${distX}, y:${distY}`)
    if (distX > 2 || distY > 2) {
      clickAvailable = false;
    }
  }
}

function up(event) {
  console.log(event)
  if (isMouseDown) {
    isMouseDown = false;

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

    if (clickAvailable) {
      console.log("clicked!");
      if (event.target.closest(".tile")) {
        console.log('inTile');
        event.target.focus({preventScroll: true});
      } else if (event.target.closest(".tileHolder")) {
        console.log('inTileHolder');
        document.activeElement.blur();
      }
      clickAvailable = false;
    }
  }
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

function scrollToTile(x, y) {
  // TODO: Scroll Viewport?
  // let row = table.rows[Math.floor(table.rows.length / 2) - y];
  // let cell = row.cells[x + Math.floor(row.cells.length / 2)];
  // cell.scrollIntoView({
  //   behavior: "auto",
  //   block: "center",
  //   inline: "center",
  // });
  //TODO: FIX!
}

window.addEventListener("hashchange", (event) => {
  console.log(event);
  goToHash();
});

function goToHash() {
  const hash = location.hash.split(",");
  if (hash.length == 2) {
    let x = parseInt(hash[0].substring(1));
    let y = parseInt(hash[1]);
    console.log(`x:${x}, y:${y}`);
    if (!(x >= -33 && x <= 33 && y >= -33 && y <= 33)) {
      x = 0;
      y = 0;
    }
    scrollToTile(x, y);
    // TODO: Set Focus!
  } else {
    scrollToTile(0, 0);
    // only do this if the user hasn't already scrolled on their own?
  }
}

goToHash();

// TODO: Make toggle button a webcomponent? so as to not need ById
var audio = new Audio('music/Frédéric Lardon - Cellphone - 01 MEGATEUF !!.mp3');

function setMusic(enabled) {
    if (enabled) {
        document.getElementById("music-toggle").classList.remove("toggle-show-disabled");
        document.getElementById("music-toggle").classList.add("toggle-show-enabled");
        audio.play();
    } else {
        document.getElementById("music-toggle").classList.remove("toggle-show-enabled");
        document.getElementById("music-toggle").classList.add("toggle-show-disabled");
        audio.pause();
    }
};

setMusic(false);