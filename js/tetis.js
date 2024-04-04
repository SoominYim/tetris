import BLOCKS from "./blocks.js"; // 블록 데이터 가져오기

// DOM 요소들 가져오기
const playground = document.querySelector(".playground > ul"); // 게임 보드
const gameText = document.querySelector(".game-text"); // 게임 오버 텍스트 요소
const scoreDisplay = document.querySelector(".score"); // 점수 표시
const restartButton = document.querySelector(".game-text > button"); // 게임 재시작 버튼

// 게임 설정
const GAME_ROWS = 20; // 게임 보드 행 수
const GAME_COLS = 10; // 게임 보드 열 수

// 게임 변수 초기화
let score = 0; // 현재 점수
let duration = 500; // 블록 이동 간격
let downInterval; // 블록 자동 이동 인터벌
let tempMovingItem; // 현재 움직이는 블록 정보를 임시로 저장하는 객체

// 블록 데이터 준비
const blockArray = Object.entries(BLOCKS); // 블록 데이터를 배열로 변환
const randomIndex = Math.floor(Math.random() * blockArray.length); // 무작위 인덱스 선택

// 현재 움직이는 블록 정보 초기화
const movingItem = {
  type: "",
  direction: 0,
  top: 0,
  left: 3,
};

init(); // 게임 초기화 함수 호출

// 게임 초기화 함수
function init() {
  tempMovingItem = { ...movingItem }; // 현재 움직이는 블록 정보 복사
  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine(); // 새로운 줄 추가
  }
  generateNewBlock(); // 새로운 블록 생성
}

// 새로운 줄을 맨 위에 추가하는 함수
function prependNewLine() {
  const li = document.createElement("li"); // 새로운 li 요소 생성
  const ul = document.createElement("ul"); // 새로운 ul 요소 생성
  for (let j = 0; j < GAME_COLS; j++) {
    const matrix = document.createElement("li"); // 새로운 li 요소 생성
    ul.prepend(matrix); // ul 요소에 li 추가
  }
  li.prepend(ul); // li 요소에 ul 추가
  playground.prepend(li); // 게임 보드에 li 추가
}

// 블록을 렌더링하는 함수
function renderBlocks(moveType = "") {
  const { type, direction, top, left } = tempMovingItem; // 현재 움직이는 블록 정보 가져오기
  const movingBlocks = document.querySelectorAll(".moving"); // 움직이는 블록들 선택
  movingBlocks.forEach((moving) => {
    moving.classList.remove(type, "moving"); // 움직이는 블록 클래스 제거
  });

  BLOCKS[type][direction].some((block) => {
    const x = block[0] + left; // x 좌표 계산
    const y = block[1] + top; // y 좌표 계산
    const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null; // 해당 위치의 블록 요소 선택
    const isAvailable = checkEmpty(target); // 해당 위치가 비어있는지 확인
    if (isAvailable) {
      target.classList.add(type, "moving"); // 블록 추가
    } else {
      tempMovingItem = { ...movingItem }; // 움직이는 블록 정보 복사
      if (moveType === "retry") {
        clearInterval(downInterval); // 자동 이동 인터벌 중지
        showGameoverText(); // 게임 오버 텍스트 표시
      }
      setTimeout(() => {
        renderBlocks("retry"); // 재시도하여 블록 렌더링
        if (moveType === "top") {
          seizeBlock(); // 블록을 바닥에 고정
        }
      }, 0);
      return true; // 블록 추가 실패
    }
  });
  movingItem.left = left; // 현재 블록의 x 좌표 갱신
  movingItem.top = top; // 현재 블록의 y 좌표 갱신
  movingItem.direction = direction; // 현재 블록의 방향 갱신
}

// 블록을 바닥에 고정시키는 함수
function seizeBlock() {
  const movingBlocks = document.querySelectorAll(".moving"); // 움직이는 블록들 선택
  movingBlocks.forEach((moving) => {
    moving.classList.remove("moving"); // 움직이는 블록 클래스 제거
    moving.classList.add("seized"); // 고정된 블록으로 클래스 변경
  });
  checkMatch(); // 블록이 줄을 완성했는지 확인
}

// 줄이 완성되었는지 확인하고 점수 갱신
function checkMatch() {
  const childNodes = playground.childNodes; // 게임 보드의 모든 줄
  childNodes.forEach((child) => {
    let matched = true; // 줄이 완성되었는지 여부
    child.children[0].childNodes.forEach((li) => {
      if (!li.classList.contains("seized")) {
        matched = false; // 하나라도 고정되지 않은 블록이 있으면 완성 안됨
      }
    });
    if (matched) {
      child.remove(); // 줄 제거
      prependNewLine(); // 새로운 줄 추가
      score++; // 점수 증가
      scoreDisplay.innerText = score; // 점수 업데이트
    }
  });
  generateNewBlock(); // 새로운 블록 생성
}

// 새로운 블록 생성
function generateNewBlock() {
  clearInterval(downInterval); // 이전의 자동 이동 인터벌 중지
  downInterval = setInterval(() => {
    moveBlock("top", 1); // 블록 아래로 자동 이동
  }, 1000);

  const blockArray = Object.entries(BLOCKS);
  const randomIndex = Math.floor(Math.random() * blockArray.length);

  movingItem.type = blockArray[randomIndex][0]; // 새로운 블록의 종류
  movingItem.top = 0; // 초기 y 좌표
  movingItem.left = 3; // 초기 x 좌표
  movingItem.direction = 0; // 초기 방향
  tempMovingItem = { ...movingItem }; // 현재 움직이는 블록 정보 복사
  renderBlocks(); // 블록 렌더링
}

// 블록이 비어있는지 확인하는 함수
function checkEmpty(target) {
  if (!target || target.classList.contains("seized")) {
    return false; // 블록이 이미 고정되어 있거나 존재하지 않으면 false 반환
  }
  return true; // 블록이 비어있으면 true 반환
}

// 블록을 이동시키는 함수
function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount; // 해당 방향으로 이동
  renderBlocks(moveType); // 블록 렌더링
}

// 블록을 빠르게 아래로 떨어뜨리는 함수
function dropBlock() {
  clearInterval(downInterval); // 이전의 자동 이동 인터벌 중지
  downInterval = setInterval(() => {
    moveBlock("top", 1); // 블록 아래로 자동 이동
  }, 10);
}

// 게임 오버 텍스트 표시 함수
function showGameoverText() {
  gameText.style.display = "flex"; // 게임 오버 텍스트 보이기
}

// 블록의 방향을 변경하는 함수
function changeDirection() {
  const direction = tempMovingItem.direction;
  direction === 3 ? (tempMovingItem.direction = 0) : (tempMovingItem.direction += 1); // 방향 변경
  renderBlocks(); // 블록 렌더링
}

// 키보드 이벤트 핸들링
document.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 39: // 오른쪽 화살표 키
      moveBlock("left", 1); // 오른쪽으로 이동
      break;
    case 37: // 왼쪽 화살표 키
      moveBlock("left", -1); // 왼쪽으로 이동
      break;
    case 40: // 아래 화살표 키
      moveBlock("top", +1); // 아래로 이동
      break;
    case 38: // 위 화살표 키
      changeDirection(); // 블록의 방향 변경
      break;
    case 32: // 스페이스바
      dropBlock(); // 블록을 빠르게 아래로 떨어뜨림
      break;
    default:
      break;
  }
});

// 게임 재시작 버튼 클릭 이벤트 핸들링
restartButton.addEventListener("click", () => {
  playground.innerHTML = ""; // 게임 보드 비우기
  gameText.style.display = "none"; // 게임 오버 텍스트 감추기
  init(); // 게임 초기화 함수 호출
});
