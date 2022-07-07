import BLOCKS from "./blocks.js";

// DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;

const blockArray = Object.entries(BLOCKS);
const randomImdex = Math.floor(Math.random()* blockArray.length);

const movingItem = {
    type: "",
    direction: 0,
    top: 0,
    left: 3,
}

init()

// functions
function init() {

    tempMovingItem = {...movingItem}; //... = 스프레드 오퍼레이터는 변수 안에 값만가져옴 
    for (let i = 0; i < GAME_ROWS; i++) {
        prependNewLine()
    }
    generateNewBlock();
}

function prependNewLine() {
    const li = document.createElement("li"); // li생성
    const ul = document.createElement("ul"); // ul생성
    for (let j = 0; j < GAME_COLS; j++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    playground.prepend(li);
}
function renderBlocks(moveType = ""){
    const{type, direction , top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type,"moving");
    })

    BLOCKS[type][direction].some(block=>{
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvaliable = checkEmpty(target);
        if (isAvaliable){
            target.classList.add(type,"moving");
        } else{
            tempMovingItem = {...movingItem}
            if(moveType === 'retry'){
                clearInterval(downInterval);
                showGameoverText();
            }
            setTimeout(()=>{
                renderBlocks('retry');
                if(moveType === "top"){
                    seizBlock();
                }
            },0)
            return true;
        }
    })
        movingItem.left =left;
        movingItem.top =top;
        movingItem.direction=direction;
}
function seizBlock(){
    const{type, direction , top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch();
}

function checkMatch(){

    const childNodes = playground.childNodes;
    childNodes.forEach(child =>{
        let matched = true;
        child.children[0].childNodes.forEach(li=>{
            if(!li.classList.contains("seized")){
                matched = false;
            }
        })
        if(matched){
            child.remove();
            prependNewLine();
            score++;
            scoreDisplay.innerText= score;
        }
    })

    generateNewBlock()
}

function generateNewBlock(){

    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock("top",1)
    },1000)

    const blockArray = Object.entries(BLOCKS);
    const randomImdex = Math.floor(Math.random()* blockArray.length);

    movingItem.type =blockArray[randomImdex][0];
    movingItem.top =0;
    movingItem.left =3;
    movingItem.direction =0;
    tempMovingItem = {...movingItem};
    renderBlocks();
}

function checkEmpty(target){
    if(!target || target.classList.contains("seized")){
        return false;
    }
    return true;
}

function moveBlock(moveType,amount){
    tempMovingItem[moveType] +=amount
    renderBlocks(moveType);
}

function dropBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(( )=>{
        moveBlock('top',1);
    },10)
}

function showGameoverText(){
    gameText.style.display = "flex"
}

function changeDirection(){
    const direction = tempMovingItem.direction ;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction +=1;
    renderBlocks();
}


// event handling
document.addEventListener("keydown",e=>{
    switch(e.keyCode){
        case 39:
            moveBlock("left",1);
            break;
        case 37:
            moveBlock("left",-1);
            break;
        case 40:
            moveBlock("top",+1);
            break;
        case 38:
            changeDirection();
            break;
        case 32:
            dropBlock();
            break;
        default:
            break;
    }
     console.log(e);
})

restartButton.addEventListener('click',()=>{
    playground.innerHTML="";
    gameText.style.display = "none"
    init();
})