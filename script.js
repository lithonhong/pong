// canvas setup
const canvas = document.getElementById("pong-canvas");
const ctx = canvas.getContext("2d");


// define settings
const canvasHeight = 600;
const canvasWidth = 800;

const paddlePaddingX = 100;
const paddleHeight = 120;
const paddleWidth = 15;
const paddleYVel = 10;

const ballRadius = 12;
const ballVel = 8;

const red = "hsl(355, 100%, 85%)";
const blue = "hsl(200, 100%, 85%)";
const green = "hsl(120, 100%, 85%)";
const yellow = "hsl(50, 80%, 80%)";
const black = "hsl(0, 0%, 10%)";

const keysDetecting = [
    "w", "s", "ArrowUp", "ArrowDown"
];


function collides(obj1, obj2) {
    return obj1.x - obj1.width / 2 - 1 < obj2.x + obj2.width / 2 + 1 &&
        obj1.x + obj1.width / 2 + 1> obj2.x - obj2.width / 2 - 1 &&
        obj1.y - obj1.height / 2 - 1 < obj2.y + obj2.height / 2 + 1 &&
        obj1.y + obj1.height / 2 + 1 > obj2.y - obj2.height / 2 - 1
}

function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    console.log("Coordinate x: " + x * 4 / 3, "Coordinate y: " + y * 4 / 3);
}

const keybinds = {
    "w": [1, "up"],
    "s": [1, "down"],
    "ArrowUp": [2, "up"],
    "ArrowDown": [2, "down"],
};

// construct objects
class Paddle {
    constructor(playerName, playerNum) {
        this.name = playerName;
        this.playerNum = playerNum;
        this.y = canvasHeight / 2;

        this.width = paddleWidth;
        this.height = paddleHeight;

        this.yVel = 0;
        this.yAcc = 1;

        switch (playerNum) {
            case 1:
                this.x = paddlePaddingX;
                this.color = red;
                break;
            case 2:
                this.x = canvasWidth - paddlePaddingX;
                this.color = blue;
                break;
            default:
                this.x = paddlePaddingX;
                this.color = green;
                break;
        }
    }

    init() {
        this.y = canvasHeight / 2;

        this.yVel = 0;
        this.yAcc = 1;

        switch (this.playerNum) {
            case 1:
                this.x = paddlePaddingX;
                break;
            case 2:
                this.x = canvasWidth - paddlePaddingX;
                break;
            default:
                this.x = paddlePaddingX;
        }
    }

    move(dir) {
        if (dir === "up") {
            this.yVel -= this.yAcc;
            this.yVel = Math.max(this.yVel, 0 - paddleYVel);
        } else if (dir === "down") {
            this.yVel += this.yAcc;
            this.yVel = Math.min(this.yVel, paddleYVel);
        }
    }

    physics() {
        this.y += this.yVel;
        this.yVel *= 0.9;

        if ((this.y - this.height / 2) < 0) {
            this.y = this.height / 2;
            this.yVel = 0;
        }

        if ((this.y + this.height / 2) > canvasHeight) {
            this.y = canvasHeight - this.height / 2;
            this.yVel = 0;
        }
    }

    render() {
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        );
    }
}

class Ball {
    constructor() {
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.radius = ballRadius;
        this.width = this.radius;
        this.height = this.radius;
        this.vel = ballVel;
        this.dir = Math.PI/3;
    }

    init() {
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.vel = 0;
        this.dir = (Math.floor(Math.random() * 4) * 2 + 1) * Math.PI/4 + (Math.random() - 0.5) * Math.PI / 12;
        setTimeout(() => {this.vel = ballVel}, 1000);
    }

    bounce(dir, obj=null) {
        let oldCoords = (this.x, this.y);

        if (obj !== null) {
            while (collides(this, obj)) {
                this.x -= 0.1 * Math.cos(this.dir);
            }
            this.x
        }

        if (dir === "h") {
            this.dir = 0 - this.dir;
        } else {
            this.dir = Math.PI - this.dir;
        }
    }

    physics() {
        this.x += this.vel * Math.cos(this.dir);
        this.y -= this.vel * Math.sin(this.dir);

        // top/bottom border bouncing
        if ((this.y - this.radius) < 0) {
            this.bounce("h");
        }
        if ((this.y + this.radius) > canvasHeight) {
            this.bounce("h");
        }
    }

    render() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = green;
        ctx.fill();        
    }
}

class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.status = "menu";

        this.scores = [0, 0];
        this.roundWinner = null;

        this.paddleLeft = new Paddle("Player 1", 1);
        this.paddleRight = new Paddle("Player 2", 2);
        this.ball = new Ball();

        this.countdown = 0;
    }

    init() {
        console.log("e")
        this.roundWinner = null;

        this.paddleLeft.init();
        this.paddleRight.init();
        this.ball.init();
    }

    getInput() {
        for (const key of keysDetecting) {
            if (!keysPressed[key]) {
                continue;
            }

            let tgt = keybinds[key][0];
            let action = keybinds[key][1];
            if (tgt === 1) {
                this.paddleLeft.move(action);
            } else if (tgt === 2) {
                this.paddleRight.move(action);
            } else {
                console.log(tgt === 1);
            }
        }
    }

    checkScore() {
        if ((this.ball.x + this.ball.radius) < 0) {
            if (this.roundWinner === null) {
                this.scores[1] += 1;
                this.roundWinner = this.paddleRight.name;
                setTimeout(() => {this.init()}, 1000);
            }
        }

        if ((this.ball.x - this.ball.radius) > canvasWidth) {
            if (this.roundWinner === null) {
                this.scores[0] += 1;
                this.roundWinner = this.paddleLeft.name;
                setTimeout(() => {this.init()}, 1000);
            }
        }
    }

    physics() {
        this.paddleLeft.physics();
        this.paddleRight.physics();
        this.ball.physics();

        if (collides(this.ball, this.paddleLeft)) {
            this.ball.bounce("v", this.paddleLeft);
            
        }

        if (collides(this.ball, this.paddleRight)) {
            this.ball.bounce("v", this.paddleRight);
        }
    }

    renderBackground() {
        this.ctx.fillStyle = black;
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    renderGameScreen(ctx) {
        this.renderBackground(ctx);
        this.ball.render(ctx);
        this.paddleLeft.render(ctx);
        this.paddleRight.render(ctx);

        this.ctx.fillStyle = yellow;
        this.ctx.font = "bold 30px 'Courier New'";
        this.ctx.textBaseline = "top";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`${this.scores[0]} - ${this.scores[1]}`, canvasWidth / 2, 20);
        this.ctx.fillText("PONG!", canvasWidth / 2, 550);

        if (this.roundWinner !== null) {
            this.ctx.fillStyle = green;
            this.ctx.font = "small-caps bold 32px 'Courier New'";
            this.ctx.textBaseline = "middle";
            this.ctx.textAlign = "center";
            this.ctx.fillText(`${this.roundWinner} wins!`, canvasWidth / 2, 300);
        }
    }

    gameTick() {
        this.getInput();
        this.physics();
        this.checkScore();
        this.renderGameScreen(this.ctx);
    }

    menuTick() {
        this.renderBackground();

        this.ctx.fillStyle = yellow;
        this.ctx.font = "bold small-caps 50px 'Courier New'";
        this.ctx.textBaseline = "top";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`Pong!`, canvasWidth / 2, 100);

        this.ctx.font = "22px 'Courier New'";
        this.ctx.fillStyle = green;
        this.ctx.fillText(`Hit the ball into the other player's side to win!`, canvasWidth / 2, 175);
        this.ctx.fillText(`Press SPACE to play`, canvasWidth / 2, 450);

        this.ctx.font = "small-caps 25px 'Courier New'";
        this.ctx.fillStyle = red;
        this.ctx.fillText(`Player 1: WASD`, canvasWidth / 4, 270);

        this.ctx.fillStyle = blue;
        this.ctx.fillText(`Player 2: Arrow keys`, canvasWidth / 4 * 3, 270);

        this.getInput();
    }

    pauseTick() {
        this.renderBackground();
        this.ctx.fillStyle = red;
        this.ctx.font = "bold 64px 'Courier New'";
        this.ctx.textBaseline = "top";
        this.ctx.textAlign = "center";
        this.ctx.fillText("PAUSED", canvasWidth / 2, 200);
        
        this.ctx.fillStyle = blue;
        this.ctx.font = "bold 30px 'Courier New'";
        this.ctx.textBaseline = "top";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Press SPACE to play", canvasWidth / 2, 375);
    }

    readyInit() {
        this.status = "ready";
        this.countdown = 3;
        this.interval = setInterval(() => {this.countdown -= 1}, 1000);
    }

    readyTick() {
        this.renderBackground();
    
        this.ctx.fillStyle = blue;
        this.ctx.font = "bold 30px 'Courier New'";
        this.ctx.textBaseline = "top";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Get ready!", canvasWidth / 2, 200);

        this.ctx.fillStyle = [blue, green, yellow, red][this.countdown];
        this.ctx.font = "bold 64px 'Courier New'";
        this.ctx.textBaseline = "top";
        this.ctx.textAlign = "center";
        this.ctx.fillText(String(this.countdown), canvasWidth / 2, 350);

        if (this.countdown === 0) {
            clearInterval(this.interval);
            this.status = "game";
        }
    }

    tick() {
        if (this.status === "menu") {
            this.menuTick();
        } else if (this.status === "game") {
            this.gameTick();
        } else if (this.status === "pause") {
            this.pauseTick();
        } else if (this.status === "ready") {
            this.readyTick();
        }

    }
}

// keys manager

let keysPressed = {};

for (const key of keysDetecting) {
    keysPressed[key] = false;
}

document.addEventListener("keydown", (e) => {
    if (keysDetecting.includes(e.key)) {
        keysPressed[e.key] = true;
    }
    if (e.key === ' ') {
        switch (instance.status) {
            case "pause":
                instance.readyInit();
                break;
            
            case "game":
                instance.status = "pause";
                break;
            
            case "ready":
                instance.status = "pause";
                clearInterval(instance.interval);
                break;
            
            case "menu":
                instance.readyInit();
                setTimeout(() => {instance.init()}, 3000);
                break;
        }
    }
});

document.addEventListener("keyup", (e) => {
    if (keysDetecting.includes(e.key)) {
        keysPressed[e.key] = false;
    }
});

// the actual thing
const instance = new Game(ctx);

function animate() {
    instance.tick();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);