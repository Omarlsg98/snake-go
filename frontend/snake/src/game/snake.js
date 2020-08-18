import Phaser from 'phaser'
import BootScene from './scenes/BootScene'
import PlayScene from './scenes/PlayScene'

var squareSize=16;
var boardHeight=30;
var boardWidth=60;
var initialSpeed=50;

var config = {
    type: Phaser.WEBGL,
    width: squareSize*boardWidth,
    height: squareSize*boardHeight,
    backgroundColor: '#C9FFAC',
    parent: containerId,
    scene: [BootScene, PlayScene]
};

var snake;
var food;
var poison;
var obstacle;
var cursors;

//  Direction consts
var UP = 0;
var DOWN = 1;
var LEFT = 2;
var RIGHT = 3;

var game = new Phaser.Game(config);

function preload() {
    this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('food', 'assets/games/snake/food.png');
    this.load.image('body', 'assets/games/snake/body.png');
}

function create() {
    var Food = new Phaser.Class({
        Extends: 
            Phaser.GameObjects.Image,
        initialize:
            function Food(scene, x, y) {
                Phaser.GameObjects.Image.call(this, scene)

                this.setTexture('food');
                this.setTintFill(0x00ff00);
                this.setPosition(x * squareSize, y * squareSize);
                this.setOrigin(0);

                this.total = 0;

                scene.children.add(this);
            },
        eat:
            function () {
                this.total++;
        }
    });

    var Poison = new Phaser.Class({
        Extends: 
            Phaser.GameObjects.Image,
        initialize:
            function Poison(scene, x, y) {
                Phaser.GameObjects.Image.call(this, scene)

                this.setTexture('food');
                this.setTintFill(0xff0000);
                this.setPosition(x * squareSize, y * squareSize);
                this.setOrigin(0);
                this.timeToAppear=1000;//15000;
                this.timeToPerish=5000;
                this.timeOfLastEvent=0;
                scene.children.add(this);
            },
        dissapear:
            function (time) {
                this.timeOfLastEvent=time;
                this.setPosition(-1*squareSize,-1*squareSize);
        },
        cycle:
            function(time){
            //Spawn or despawn the poison if the time has past
            //if the poison is not in the board
            if(this.x<0){
                if(time>=(this.timeToAppear+this.timeOfLastEvent)){
                    this.timeOfLastEvent=time;
                    repositionFoodstuff(false);
                }
            }else{
                if(time>=(this.timeToPerish+this.timeOfLastEvent)){
                    this.dissapear(time);
                }
            }
        }
    });
        var Obstacle = new Phaser.Class({
        initialize:
            function Obstacle(scene) {
                this.parts = scene.add.group();
                this.currentObstacleType=-1;
        },
        changeStructure:
            function (){
                //reset obstacles
                this.parts.clear(true,true);
                var obstacleType=-2;
                while(true){
                    obstacleType= Math.floor(Math.random() * 5); //entre 0 y *n
                    if(this.currentObstacleType!=obstacleType)
                        break;
                }
                this.currentObstacleType=obstacleType;
                for (let x = 0; x < boardWidth; x++) {
                    for (let y = 0; y < boardHeight; y++) {
                        let createPart=false;
                        switch(obstacleType) {
                            //Generate walls
                            case 0:         
                                createPart= (x==0 || y==0 || x==boardWidth-1 || y==boardHeight-1);
                                break;
                            case 1:         
                                createPart= (x==boardHeight-y) || (boardWidth-x==boardHeight-y);
                                break;
                            case 2:         
                                createPart= (x==y) || (boardWidth-x==y);
                                break;
                            case 3:         
                                createPart= (x==Math.floor(boardWidth/2) || y==Math.floor(boardHeight/2));
                                break;
                            case 4:         
                                createPart= (y==Math.floor(boardHeight*(3/4)) || y==Math.floor(boardHeight*(1/4)))
                                            && x>Math.floor(boardWidth*(1/7)) && x<Math.floor(boardWidth*(6/7));
                                break;             
                            default:
                                // code block
                        }
                        if(createPart)
                            this.addPart(x,y);
                    }
                }                     
            },
        addPart: 
            function (x,y) {
                var newPart = this.parts.create(x * squareSize, y * squareSize, 'body');
                newPart.setOrigin(0);
                newPart.setTintFill(0x17202A);
        },
        checkGrid: 
            function (grid) {
                //  Remove all body pieces from valid positions list
                this.parts.children.each(function (segment) {

                    var bx = segment.x / squareSize;
                    var by = segment.y / squareSize;

                    grid[by][bx] = false;
                });
                return grid;
        }
        });


    var Snake = new Phaser.Class({

        initialize:
            function Snake(scene, x, y) {
                this.headPosition = new Phaser.Geom.Point(x, y);

                this.body = scene.add.group();

                this.head = this.body.create(x * squareSize, y * squareSize, 'body');
                this.head.setOrigin(0);

                this.alive = true;

                this.speed = initialSpeed;

                this.moveTime = 0;

                this.tail = new Phaser.Geom.Point(x, y);

                this.heading = RIGHT;
                this.direction = RIGHT;
            },
        update: function (time) {
            if (time >= this.moveTime) {
                return this.move(time);
            }
        },

        faceLeft: function () {
            if (this.direction === UP || this.direction === DOWN) {
                this.heading = LEFT;
            }
        },

        faceRight: function () {
            if (this.direction === UP || this.direction === DOWN) {
                this.heading = RIGHT;
            }
        },

        faceUp: function () {
            if (this.direction === LEFT || this.direction === RIGHT) {
                this.heading = UP;
            }
        },

        faceDown: function () {
            if (this.direction === LEFT || this.direction === RIGHT) {
                this.heading = DOWN;
            }
        },

        move: function (time) {
            /**
            * Based on the heading property (which is the direction the pgroup pressed)
            * we update the headPosition value accordingly.
            * 
            * The Math.wrap call allow the snake to wrap around the screen, so when
            * it goes off any of the sides it re-appears on the other.
            */
            switch (this.heading) {
                case LEFT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x - 1, 0, boardWidth);
                    break;

                case RIGHT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x + 1, 0, boardWidth);
                    break;

                case UP:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y - 1, 0, boardHeight);
                    break;

                case DOWN:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y + 1, 0, boardHeight);
                    break;
            }

            this.direction = this.heading;

            //  Update the body segments and place the last coordinate into this.tail
            Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * squareSize, this.headPosition.y * squareSize, 1, this.tail);

            //  Check to see if any of the body pieces have the same x/y as the head
            //  If they do, the head ran into the body

            var hitBody = Phaser.Actions.GetFirst(this.body.getChildren(), { x: this.head.x, y: this.head.y }, 1);

            if (hitBody) {
                this.dead();

                return false;
            }
            else {
                //  Update the timer ready for the next movement
                this.moveTime = time + this.speed;
                return true;
            }
        },
        dead:
            function(){
                console.log('dead');

                this.alive = false;
            },
        grow: 
            function () {
                var newPart = this.body.create(this.tail.x, this.tail.y, 'body');

                newPart.setOrigin(0);
        },
        degrow: 
            function () {
                this.body.getLast(true,true).destroy();
                this.body.getLast(true,true).destroy()
                if(this.body.getLast(true)== null){
                    this.dead();
                }
        },
        collideWithObstacle: 
            function (obstacle) {
                var hitBody = Phaser.Actions.GetFirst(obstacle.parts.getChildren(), { x: this.head.x, y: this.head.y });
                if (hitBody) {
                    this.dead();
                    return true;
                }
                    return false;
        },
        collideWithFood: 
            function (food,obstacle) {
                if (this.head.x === food.x && this.head.y === food.y) {
                    this.grow();
                    food.eat();
                    // For every 5 items of food eaten we'll increase the snake speed a little
                    if (this.speed > 10 && food.total % 5 === 0) {
                        this.speed -= 5;
                    }
                    if (food.total % 2 === 0){
                        obstacle.changeStructure();
                    }
                    return true;
                }
                else {
                    return false;
                }
        },
        collideWithPoison: 
            function (poison,time) {
                if (this.head.x === poison.x && this.head.y === poison.y) {
                    this.degrow();
                    poison.dissapear(time);
                    return true;
                }
                else {
                    return false;
                }
        },
        checkGrid: 
            function (grid) {
                //  Remove all body pieces from valid positions list
                this.body.children.each(function (segment) {

                    var bx = segment.x / squareSize;
                    var by = segment.y / squareSize;

                    grid[by][bx] = false;
                });
                return grid;
        }
    });

    food = new Food(this, 3, 4);
    snake = new Snake(this, 8, 8);
    poison= new Poison(this,-1,-1);
    obstacle = new Obstacle(this);

    //  Create our keyboard controls
    cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
    if (!snake.alive) {
        return;
    }
    /**
    * Check which key is pressed, and then change the direction the snake
    * is heading based on that. The checks ensure you don't double-back
    * on yourself, for example if you're moving to the right and you press
    * the LEFT cursor, it ignores it, because the only valid directions you
    * can move in at that time is up and down.
    */
    if (cursors.left.isDown) {
        snake.faceLeft();
    }
    else if (cursors.right.isDown) {
        snake.faceRight();
    }
    else if (cursors.up.isDown) {
        snake.faceUp();
    }
    else if (cursors.down.isDown) {
        snake.faceDown();
    }

    if (snake.update(time)) {
        //  If the snake updated, we need to check for collisions
        if (snake.collideWithObstacle(obstacle)){
            //dead
        } else if (snake.collideWithFood(food,obstacle)) {
            repositionFoodstuff(true);
        }else if (snake.collideWithPoison(poison,time)){
            //Animation (?)
        } 
    }
    poison.cycle(time);
}

/**
* We can place the food anywhere in our grid
* *except* on-top of other objects, so we need
* to filter those out of the possible food locations.
* If there aren't any locations left, they've won!
*
* @method repositionFood
* @parameter {boolean} isGreenApple: true if we are trying to cahnge the position of a Green Apple (food)
* @return {boolean} true if the food was placed, otherwise false
*/
function repositionFoodstuff(isGreenApple) {
    var validLocations= getValidLocations();
    if (validLocations.length > 0) {
        //  Use the RNG to pick a random food position
        var pos = Phaser.Math.RND.pick(validLocations);

        //  And place it
        if(isGreenApple){
            food.setPosition(pos.x * squareSize, pos.y * squareSize);
        }else{
            poison.setPosition(pos.x * squareSize, pos.y * squareSize);
        }

        return true;
    }
    else {
        return false;
    }
}


    /**
* @method repositionFood
* @return {x,y}array with the valid positions to spawn new objects
*/
function getValidLocations(){
    //  First create an array that assumes all positions
    //  are valid for the new piece

    //  A Grid we'll use to know where we can put the new piece
    var testGrid = [];

    for (var y = 0; y < boardHeight; y++) {
        testGrid[y] = [];

        for (var x = 0; x < boardWidth; x++) {
            testGrid[y][x] = true;
        }
    }
    //check food location
    testGrid[food.y/squareSize][food.x/squareSize] = false;
    //check posion location
    if(poison.x>0){
        testGrid[poison.y/squareSize][poison.x/squareSize] = false;
    }
    //check obstacles location
    obstacle.checkGrid(testGrid);
    //check snake loaction
    snake.checkGrid(testGrid);

    //  Purge out false positions
    var validLocations = [];

    for (var y = 0; y < boardHeight; y++) {
        for (var x = 0; x < boardWidth; x++) {
            if (testGrid[y][x] === true) {
                //  Is this position valid for food? If so, add it here ...
                validLocations.push({ x: x, y: y });
            }
        }
    }
    return validLocations;
}


export default game;
export { game }