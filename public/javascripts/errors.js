let active,
  angle,
  edge,
  entryArea,
  explosionSize,
  flameTimeout,
  gravity,
  ground,
  playing,
  position,
  rocketSize,
  safe,
  speed,
  start,
  turn,
  velocity;

let moveRate = 1;
let turnRate = 0.5;

const rocket = document.querySelector(".rocket");
const airspace = document.querySelector(".airspace");
const flame = document.querySelector(".flicker");
const crash = document.querySelector(".crash");
const explosion = document.querySelector(".explosion");
const planet1 = document.querySelector(".planet-one");
const planet2 = document.querySelector(".planet-two");
const surface = document.querySelector(".surface");
const planetColors = [
  "#ceac25",
  "#933223",
  "#5a3360",
  "#547f27",
  "#734b5e",
  "#7f6452"
];

let space = document.querySelector(".space");
let popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");
const result = document.querySelector(".result");
const message = document.querySelector(".message");

function calculateSizes() {
  // The rocket size is dependent on the screen size so the actual size is needed to calculate position etc
  rocketSize = {
    width: rocket.getBoundingClientRect().width,
    height: rocket.getBoundingClientRect().height
  };

  // Set the size of the explosion early on because the size changes with the animation which caused a bug
  explosionSize = {
    width: (
      explosion.getBoundingClientRect().width / 2 -
      rocketSize.width / 2
    ).toFixed(),
    height: (
      explosion.getBoundingClientRect().height / 2 -
      rocketSize.height / 2
    ).toFixed()
  };

  // Calculate possible entry range for the rocket, not too close to the sides of the screen
  entryArea = {
    width: airspace.offsetWidth - 2 * rocketSize.width
  };

  // Define where the ground should be in relation to the screen size.
  ground = airspace.offsetHeight - rocketSize.height;
  edge = airspace.offsetWidth - rocketSize.width;
}

function placePlanet(planet) {
  let x = Math.floor(Math.random() * entryArea.width);
  let y = Math.floor(Math.random() * ground);
  let scale = 0.5 + Math.random() * 3;
  let transform = "translate(" + x + "px, " + y + "px) scale(" + scale + ")";
  planet.style.transform = transform;
  planet.style.opacity = 1;
}

function updatePosition(moveRate) {
  let rad = angle * (Math.PI / 180);
  position.x += Math.sin(rad) * moveRate;
  position.y -= Math.cos(rad) * moveRate;
  flame.setAttribute("opacity", 1);
  flameTimeout = 8;
}
function refresh() {
  let x = (position.x - rocketSize.width / 2).toFixed(2);
  let y = (position.y - rocketSize.height / 2).toFixed(2);
  // Prevent spiralling out of control
  if (turn > 10) {
    turn = 10;
  } else if (turn < -10) {
    turn = -10;
  }

  angle += turn;
  // Keep the angle within 360 degrees
  if (angle != 0) {
    if (angle > 180) {
      angle -= gravity.x;
      if (angle > 360) {
        angle -= 360;
      }
    }
    if (angle < 180) {
      angle += gravity.x;
      if (angle < 0) {
        angle += 360;
      }
    }
  }
  let degrees = angle.toFixed(2);
  if (safe) {
    let transform =
      "translate(" + x + "px, " + y + "px) rotate(" + degrees + "deg)";
    rocket.style.transform = transform;
  } else {
    x = x - explosionSize.width;
    y = y - explosionSize.height;
    let transform =
      "translate(" + x + "px, " + y + "px) rotate(" + degrees + "deg)";
    crash.style.transform = transform;
    crash.style.opacity = 1;
    explosion.classList.add("explode");
  }
  if (flameTimeout > 0) {
    flameTimeout--;
  } else if (flameTimeout <= 0) {
    flameTimeout = 0;
    flame.setAttribute("opacity", 0);
  }
}

function moveRocket() {
  velocity.x = position.x - position.px;
  velocity.y = position.y - position.py;

  // Add effect of gravity
  velocity.y += gravity.y;

  // Update previous values
  position.px = position.x;
  position.py = position.y;

  // Move the rocket
  position.x += velocity.x;
  position.y += velocity.y;
}

function checkBorders() {
  if (position.y - rocketSize.height / 2 > ground) {
    if (velocity.y < 2 && (angle >= 350 || angle <= 10)) {
      result.innerHTML = "You landed safely!";
      message.innerHTML = "Well Done!";
      gameOver();
    } else if (velocity.y < 5 && (angle > 340 || angle < 20)) {
      position.py = position.y + velocity.y;
      console.log(
        "Close! Your speed is " +
          velocity.y.toFixed(2) +
          " and your angle is " +
          angle.toFixed(2)
      );
    } else {
      result.innerHTML = "You crashed!";
      message.innerHTML = "Game Over!";
      safe = false;
      refresh();
      gameOver();
    }
  }
  if (position.y + rocketSize.height < 0) {
    result.innerHTML = "You were supposed to land on the planet!";
    message.innerHTML = "Don't fly off the screen.";
    gameOver();
  }
  // The following if else statement creates a tesseract effect to keep the player on screen
  // If on the right side of the screen then come back on the left side.
  if (position.x > edge + rocketSize.height) {
    position.x = 0 - rocketSize.height + 10;
    position.px = 0 - rocketSize.height + 10 - velocity.x;
  } else if (position.x < 0 - rocketSize.height) {
    position.x = edge + rocketSize.height - 10;
    position.px = edge + rocketSize.height - 10 - velocity.x;
  }
}

function update() {
  checkBorders();
  if (safe) {
    moveRocket();
    refresh();
  }
}

function gameOver() {
  // Deactivate the game
  active = false;
  clearInterval(playing);
  popup = document.getElementById("results");
  openPopup();
}

function startGame() {
  // Activate the game
  active = true;
  placeElements();
  surface.style.background =
    planetColors[Math.floor(Math.random() * planetColors.length)];
  angle = 0 + Math.floor(Math.random() * 359); // Never give 0 angle as a starting condition
  crash.style.opacity = 0;
  explosion.classList.remove("explode");
  flameTimeout = 0;
  gravity = {
    x: 0.1,
    y: 0.05
  };
  position = new (function() {
    (this.x = rocketSize.width + Math.floor(Math.random() * entryArea.width)),
      (this.y = 100),
      (this.px = this.x), // Previous X
      (this.py = this.y); // Previous Y
  })();
  safe = true;
  speed = 0;
  turn = 0;
  velocity = {
    x: 0,
    y: 0
  };
  closePopup();
  result.innerHTML = "";
  message.innerHTML = "";
  playing = setInterval(update, 1000 / 30);
  refresh(); // Needed to run this to prevent the visual displacement of the rocket when the opacity is changed
  rocket.style.opacity = 1;
}

function placeElements() {
  // Changing the opacity is to prevent a visual bug
  planet1.style.opacity = 0;
  planet2.style.opacity = 0;
  space.style.opacity = 0;
  // Calculate the new solar system layout
  placePlanet(planet1);
  placePlanet(planet2);
  createStars();
  // Make the elements visible again
  planet1.style.opacity = 1;
  planet2.style.opacity = 1;
  space.style.opacity = 1;
}

function createStars() {
  let heightMax = window.innerHeight - 4,
    widthMax = window.innerWidth - 4;
  space.innerHTML = "";

  for (let i = 0; i < 100; i++) {
    const star =
      '\n <div style="left:' +
      Math.floor(Math.random() * widthMax) +
      "px; top:" +
      Math.floor(Math.random() * heightMax) +
      "px; height:" +
      Math.ceil(Math.random() * 100) / 100 +
      "vmax; width:" +
      Math.ceil(Math.random() * 100) / 100 +
      'vmax;" class="star star' +
      i +
      '"><svg viewBox="0 0 513 513"><use xlink:href="#star"/></svg></div>';
    space.insertAdjacentHTML("beforeend", star);
  }
}

function openPopup() {
  start = popup.querySelector("button");
  start.addEventListener("click", startGame);
  popup.style.display = "block";
  overlay.style.display = "block";
  popup.style.opacity = "1";
  overlay.style.opacity = "1";
}

function closePopup() {
  start.removeEventListener("click", startGame);
  overlay.style.opacity = "0";
  popup.style.opacity = "0";
  popup.style.display = "none";
  overlay.style.display = "none";
}

window.addEventListener(
  "keydown",
  function(event) {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        // Apply Thruster
        updatePosition(moveRate);
        break;
      case "KeyA":
      case "ArrowLeft":
        // Rotate Left
        turn -= turnRate;
        break;
      case "KeyD":
      case "ArrowRight":
        // Rotate Right
        turn += turnRate;
        break;
      case "Space":
        // If the game is inactive then the user can start a new round by pushing the Spacebar
        if (!active) {
          startGame();
        }
        break;
    }
  },
  true
);

window.addEventListener("resize", function(event) {
  if (active) {
    result.innerHTML = "The game is using your screen size.";
    message.innerHTML = "Don't resize the screen during the game.";
    gameOver();
  }
  calculateSizes();
});

// Trying to implement controls for accelerometer devices
// Note: Doesn't work as intended on Codepen
window.addEventListener("deviceorientation", function(e) {
  if (active) {
    let rotation;
    if (window.orientation === 0) {
      // Portrait Mode
      rotation = e.gamma;
    } else if (window.orientation == 90) {
      // Landscape Mode Anti-Clockwise Rotation
      rotation = e.beta;
    } else if (window.orientation == -90) {
      // Landscape Mode Clockwise Rotation
      rotation = e.beta * -1;
    }
    // Apply the amount of rotation in order to turn the rocket
    if (rotation > 2 || rotation < -2) {
      turn += 0.005 * rotation;
    }
  }
});

// If the screen is tapped then apply the thruster effect
airspace.addEventListener("touchstart", function(e) {
  if (active) {
    e.preventDefault();
    updatePosition(1);
  }
});

document.addEventListener("DOMContentLoaded", function(event) {
  calculateSizes();
  placeElements();
  openPopup();
});
