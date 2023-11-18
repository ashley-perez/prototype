title = "BEST GAME";

description = `
    use mouse to move 



 be careful how fast you
    go

move slow - bullets slow
move fast - bullets fast
    don't stop moving
`;

const gameConstants = {
  WIDTH: 150,
  HEIGHT: 250,
  NORMAL_BULLET_SPEED: 1.8,
  FAST_BULLET_SPEED: 3,
  FREEZE: 1,
  FIRE_RATE: 80,
  STAR_SPEED_MIN: 0.5,
  STAR_SPEED_MAX: 1.0,
};

characters = [
  `
  ll
llllll
  ll
  ll
llllll
l    l
`,

  `
ll
ll
ll
`,

  `
 lll
ll ll
l lll
lllll
 lll
`,
];

/**
 * @typedef {{
 * pos: Vector,
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector,
 * speed: number,
 * coolDown: number,
 * }} Enemy
 */

/**
 * @type { Enemy []}
 */
let enemies;

/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * }} Star
 */

/**
 * @type  { Star [] }
 */
let stars;

/**
 * @typedef {{
 * pos: Vector,
 * angle: number,
 * rotation: number,
 * despawn: number
 * }} EBullet
 */

/**
 * @type { EBullet [] }
 */
let eBullets;

/** @type {Vector[]} */
let coins;

let prevMouseX = 0;
let prevMouseY = 0;
let prevTime = 0;
let currTime = 0;
let playerSpeed;
let start = false;
let nextCoinDist = 0;

let bulletSpeed = 0;

options = {
  viewSize: { x: gameConstants.WIDTH, y: gameConstants.HEIGHT },
  theme: "shapeDark",
  isReplayEnabled: true,
  isPlayingBgm: true,
};

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function update() {
  if (!ticks) {
    stars = times(20, () => {
      const posX = rnd(0, gameConstants.WIDTH);
      const posY = rnd(0, gameConstants.HEIGHT);
      // an object of type Star with appropriate properties
      return {
        pos: vec(posX, posY),
        speed: rnd(gameConstants.STAR_SPEED_MIN, gameConstants.STAR_SPEED_MAX),
      };
    });

    enemies = [];
    eBullets = [];
    coins = [];
    nextCoinDist = 0;

    // spawn in the enemies
    if (enemies.length === 0) {
      for (let i = 0; i < 5; i++) {
        const posX = rnd(0, 100);
        const posY = rnd(10, gameConstants.HEIGHT);

        enemies.push({
          pos: vec(posX, posY),
          speed: gameConstants.NORMAL_BULLET_SPEED,
          coolDown: rnd(55, gameConstants.FIRE_RATE),
        });
      }
    }
  }

  stars.forEach((s) => {
    s.pos.x -= s.speed;
    s.pos.wrap(0, gameConstants.WIDTH, 0, gameConstants.HEIGHT);

    color("light_black");
    box(s.pos, 2);
  });

  player = {
    pos: vec(gameConstants.WIDTH * 0.5, gameConstants.HEIGHT * 0.5),
  };
  player.pos = vec(input.pos.x, input.pos.y);
  player.pos.clamp(0, gameConstants.WIDTH, 0, gameConstants.HEIGHT);
  color("green");
  box(player.pos, 4);

  // enemies spawn in after the player touches the cyan circle
  if (start) {
    // calcuate player speed using previous positions and current positions
    let differenceX = input.pos.x - prevMouseX;
    let differenceY = input.pos.y - prevMouseY;
    let diffTime = performance.now() - prevTime;

    // check so that we don't divide by zero
    if (diffTime > 0) {
      // speed forumula
      playerSpeed = Math.sqrt(differenceX ** 2 + differenceY ** 2) / diffTime;
    }

    // the magic numbers that actually dictate how the player should move quickly or slowly
    // dont stand still or its over, keep moving
    if (playerSpeed === 0) {
      console.log("STOPPED");
      bulletSpeed = gameConstants.FAST_BULLET_SPEED;
    } else if (playerSpeed > 0 && playerSpeed < 0.12) {
      console.log("SLOW", playerSpeed);
      bulletSpeed = gameConstants.FREEZE;
    } else if (playerSpeed >= 0.12 && playerSpeed < 0.18) {
      console.log("normal", playerSpeed);
      bulletSpeed = gameConstants.NORMAL_BULLET_SPEED;
    } else if (playerSpeed >= 0.18) {
      console.log("FAST");
      bulletSpeed = gameConstants.FAST_BULLET_SPEED;
    }

    prevMouseX = input.pos.x;
    prevMouseY = input.pos.y;
    prevTime = performance.now();

    remove(enemies, (e) => {
      // move enemies
      e.pos.x += 0.8;

      if (
        e.pos.x > gameConstants.WIDTH ||
        e.pos.x < 0 ||
        e.pos.y > gameConstants.HEIGHT ||
        e.pos.y < 0
      ) {
        e.pos = vec(0, rnd(0, gameConstants.HEIGHT));
      }

      // bullet cooldown
      e.coolDown--;
      // spawn the bullet
      if (e.coolDown <= 0) {
        eBullets.push({
          pos: vec(e.pos.x, e.pos.y),
          angle: e.pos.angleTo(player.pos),
          rotation: rnd(),
          despawn: 0,
        });
        e.coolDown = rnd(75, gameConstants.FIRE_RATE);
        // console.log(e.coolDown);>
      }

      // const isBulletHitPlayer = char("b", e.pos).isColliding.rect.green;
      color("red");
      const isCollidingWithPlayer = char("a", e.pos).isColliding.rect.green;
      if (isCollidingWithPlayer) {
        end();
        play("powerUp");
      }
    });

    if (nextCoinDist > 0) {
      nextCoinDist -= 1;
    }

    // spawn the coins
    if (nextCoinDist <= 0 && coins.length < 4) {
      // coins.push(vec(gameConstants.WIDTH, rnd(0, gameConstants.HEIGHT)));
      coins.push(vec(rnd(0, gameConstants.WIDTH), 0));
      nextCoinDist = rnd(40, 70);
    }

    remove(coins, (c) => {
      c.y += 1.75;
      color("cyan");
      const isCollidingWithPlayer = char("c", c).isColliding.rect.green;
      if (isCollidingWithPlayer) {
        addScore(10, c);
        play("coin");
        return true;
      }
      return c.y > gameConstants.HEIGHT;
    });

    // bullet logic
    remove(eBullets, (eb) => {
      if (ticks % 100 === 0) {
        eb.angle = eb.pos.angleTo(player.pos);
      }

      eb.pos.x += bulletSpeed * Math.cos(eb.angle);
      eb.pos.y += bulletSpeed * Math.sin(eb.angle);

      // // bounce off the "walls" instead of just going off screen
      if (eb.pos.x < 0 || eb.pos.x > gameConstants.WIDTH) {
        // eb.angle = Math.PI - eb.angle;
        eb.angle = Math.PI - eb.pos.angleTo(player.pos);
      }
      if (eb.pos.y < 0 || eb.pos.y > gameConstants.HEIGHT) {
        // eb.angle = -eb.angle;
        eb.angle = Math.PI + eb.pos.angleTo(player.pos);
      }

      // remove the bullets if the player is slow (after 2 seonds)
      if (playerSpeed < 0.12) {
        eb.despawn = (eb.despawn || 0) + 1;
        // console.log(eb.despawn);
        if (eb.despawn > 60) {
          return true;
        }
      } else {
        eb.despawn = 0;
      }

      color("red");
      const isCollidingWithPlayer = char("b", eb.pos, { rotation: eb.rotation })
        .isColliding.rect.green;
      if (isCollidingWithPlayer) {
        end();
        play("powerUp");
      }

      return !eb.pos.isInRect(0, 0, gameConstants.WIDTH, gameConstants.HEIGHT);
    });
  }
  // start the game by going to the cyan circle
  else {
    color("cyan");
    arc(125, 100, 5, 35);

    // some math to check collision
    let dx = Math.abs(player.pos.x - 125);
    let dy = Math.abs(player.pos.y - 100);
    if (dx + dy <= 30) {
      start = true;
    }
  }
}
