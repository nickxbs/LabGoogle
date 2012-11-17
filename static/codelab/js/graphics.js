var canvasWidth;
var canvasHeight;

var ctx;
var lengthWeight;

var launchCounter = 0;

var canvas;

var LAUNCH_FRAMES = 40;
var SPEED_VARIATION = 50;
var BASE_SPEED = 10;
var SPEED_SCALE = 5000;
var warpFactor = 1.0;

function Star(locX, locY)
{
  this.x = locX;
  this.y = locY;

  this.overallSpeedScale = 1;

  this.updateVelocity = function()
  {
    // Stars get more gravity the farther they go ;in.
    this.velX = (targetX - this.x) / SPEED_SCALE *
        this.overallSpeedScale;
    this.velY = (targetY - this.y) / SPEED_SCALE *
        this.overallSpeedScale;
  };

  this.distanceFromCenter = function()
  {
    return Math.sqrt((this.x - targetX) *
        (this.x - targetX) +
            (this.y - targetY) *
                (this.y - targetY));
  };

  this.initTotallyRandom = function()
  {
    this.x = Math.floor(Math.random() * (canvasWidth * 10)) -
        4.5 * canvasWidth;
    this.y = Math.floor(Math.random() * (canvasHeight * 10)) -
        4.5 * canvasHeight;

    this.overallSpeedScale = Math.random() * SPEED_VARIATION + BASE_SPEED;
  };

  this.initRandom = function()
  {
    if (warpFactor >= 0)
    {
      // Pick one of four sides to appear on.
      // You need to weight this by sides and top or it looks funny.
      var random = Math.random();

      if (random < lengthWeight)
      {
        dir = Math.random() > 0.5 ? 0 : 1;
      }
      else
      {
        dir = Math.random() > 0.5 ? 2 : 3;
      }

      if (dir == 0)
      {
        this.x = Math.floor(Math.random() * (canvasWidth + 1));
        this.y = 0 - 10;
      }
      else if (dir == 1)
      {
        this.x = Math.floor(Math.random() * (canvasWidth + 1));
        this.y = canvasHeight + 10;
      }
      else if (dir == 2)
      {
        this.y = Math.floor(Math.random() * (canvasHeight + 1));
        this.x = 0 - 10;
      }
      else if (dir == 3)
      {
        this.y = Math.floor(Math.random() * (canvasHeight + 1));
        this.x = canvasWidth + 10;
      }
    }
    else
    {
      this.x = targetX + 20 * (Math.random() - 0.5);
      this.y = targetY + 20 * (Math.random() - 0.5);
    }

    this.overallSpeedScale = Math.random() * SPEED_VARIATION + BASE_SPEED;
  };

  this.destroyAsNeeded = function()
  {
    if (warpFactor > 0) {
      if (this.distanceFromCenter() < 10)
      {
        this.initRandom();
      }
    }
    else
    {
      if (this.x < 0 || this.x > canvasWidth ||
          this.height > canvasHeight || this.height < 0)
      {
        this.initRandom();
      }
    }
  };

  this.frameUpdate = function()
  {
    this.updateVelocity();

    this.x += this.velX * warpFactor;
    this.y += this.velY * warpFactor;

    this.destroyAsNeeded();
  };

  this.drawSelf = function()
  {
    var dist = this.distanceFromCenter();
    ctx.globalAlpha = dist / canvasWidth * 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, dist / canvasWidth * 5 + 1.5, 0,
            Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1.0;
  };

  return this;
}

function initStarfield() {
  canvas = document.getElementById('canvas');

  // Remember that we did this.
  initialized = true;

  // Figure out how many stars to show on the sides vs. the top
  lengthWeight = canvas.width / (canvas.width + canvas.height);

  ctx = canvas.getContext('2d');
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
  targetX = canvasWidth / 2;
  targetY = canvasHeight / 2;

  createStars();

  setWarpFactor(1.0);
  animate();
}

function hideStarfield() {
  if (!ctx) return;

  haltAnimation = true;
  ctx.fillStyle = '#7c8587';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

var stars = [];

function createStars() {
  for (var i = 0; i < 300; i++)
  {
    var star = new Star(0, 0);
    star.initTotallyRandom();
    stars.push(star);
  }
}

function clear() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function draw() {
  clear();

  ctx.fillStyle = '#7c8587';
  for (star in stars)
  {
    stars[star].frameUpdate();
    stars[star].drawSelf();
  }

  if (stars.length < 300)
  {
    var star = new Star(0, 0);
    star.initRandom();
    stars.push(star);
  }

  var launchOffset = LAUNCH_FRAMES - launchCounter;
  if (launchOffset > 0)
  {
    var ratio = launchOffset / LAUNCH_FRAMES;
    // Draw bay doors
    ctx.fillStyle = '#7c8587';
    ctx.fillRect(0, 0, canvasWidth / 2 * ratio, canvasHeight);
    ctx.fillRect(canvasWidth / 2 + (canvasWidth / 2 -
        canvasWidth / 2 * ratio),
                 0,
                 canvasWidth, canvasHeight);
  }
}

function onEnterFrame() {
  launchCounter++;
  draw();
}

// *********************************************************************
// And now here's the part you care about if you're a codelab developer!

// Informs the graphics engine to halt rendering
var haltAnimation = false;

// Says whether the animation is running
var initialized = false;

// Current target of the ship
var targetX, targetY;

/** Sets how fast the ship is going
 * @param {Number} val Your speed, in units of warp.
 */
function setWarpFactor(val) {
  warpFactor = val;
}

/** Sets where the ship is aimed
 * @param {Number} x A coordinate between 0 and canvasWidth.
 * @param {Number} y A coordinate between 0 and canvasHeight.
 */
function setWarpTarget(x, y) {
  targetX = x;
  targetY = y;
}

/** This code is from paulirish.com.
 *   It is a browser-neutral way to shim setTimeout with fallback
 */
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 10);
        };
})();

function animate() {
  // Cuts off further animation
  if (haltAnimation) {
    haltAnimation = false;
    return;
  }

  requestAnimFrame(animate);
  // Tells the graphics engine to move one frame forward
  onEnterFrame();
}

/** Called within onStatedChanged.  Should set graphics correctly
 * for that state.
 * to appropriate state.
 * @param {StateChangedEvent} event Either a state.  Can be null.
 */
function updateMainScreen(event) {
  var state = gapi.hangout.data.getState();

  // Check if we're ready to set sail, but we haven't
  // gone yet.
  if (!initialized && state.engaged == 'true') {
    initStarfield();
  }
  else if (state.engaged == null || state.engaged == 'false') {
    // Hides the visuals if we're not rolling
    // Useful for resetting state.
    hideStarfield();
  }
}
