let stopSheet; // 儲存角色1的停止動畫精靈圖
let walkingSheet; // 儲存角色1的走路動畫精靈圖
let attackSheet; // 儲存角色1的腳攻擊動畫精靈圖
let effectSheet; // 儲存腳攻擊發射的特效精靈圖
let characterX; // 儲存角色1目前的水平中心位置
let facingDirection = 1; // 記錄角色面向方向，正數向右、負數向左
let isAttacking = false; // 記錄角色是否正在播放腳攻擊動畫
let attackStartedAt = 0; // 記錄腳攻擊動畫開始的時間
let effectActive = false; // 記錄畫面上是否有移動中的攻擊特效
let effectX = 0; // 記錄攻擊特效目前的水平位置
let effectDirection = 1; // 記錄攻擊特效移動與面向的方向
let effectStartedAt = 0; // 記錄攻擊特效動畫開始的時間
let spacePressed = false; // 避免長按空白鍵重複觸發攻擊
const stopFrameCount = 7; // 設定停止精靈表中的動畫格數
const walkingFrameCount = 9; // 設定走路精靈表中的動畫格數
const attackFrameCount = 13; // 設定腳攻擊精靈表中的動畫格數
const effectFrameCount = 7; // 設定腳攻擊特效精靈表中的動畫格數
const animationSpeed = 8; // 設定每秒播放的動畫格數

function preload() { // 在畫布建立前載入角色動畫圖片
  stopSheet = loadImage('1/停止/allstop.png'); // 載入角色1的七格停止動畫精靈表
  walkingSheet = loadImage('1/走路/all走路.png'); // 載入角色1的九格走路動畫精靈表
  attackSheet = loadImage('1/要腳特效的攻擊/all腳攻擊.png'); // 載入角色1的十三格腳攻擊動畫精靈表
  effectSheet = loadImage('1/腳的特效/all腳特效.png'); // 載入七格腳攻擊特效精靈表
} // 結束圖片載入函式

function setup() { // 初始化全螢幕畫布與繪圖模式
  createCanvas(windowWidth, windowHeight); // 依照目前視窗尺寸建立畫布
  imageMode(CENTER); // 讓角色座標代表圖片中心點
  noSmooth(); // 保留精靈圖片的清晰邊緣
  characterX = width * 2 / 3; // 將角色初始位置放在畫布寬度三分之二處
} // 結束初始化函式

function draw() { // 每一影格更新背景、移動與角色動畫
  background('#87ceeb'); // 使用天空藍作為畫布背景
  const currentTime = millis(); // 取得目前動畫時間
  const movingDirection = Number(keyIsDown(RIGHT_ARROW)) - Number(keyIsDown(LEFT_ARROW)); // 依左右方向鍵狀態計算移動方向
  const attackDuration = attackFrameCount / animationSpeed * 1000; // 計算腳攻擊動畫完整播放時間
  const standardScale = min(height * 0.75 / stopSheet.height, width * 0.9 / (stopSheet.width / stopFrameCount)); // 依停止角色尺寸計算特效縮放比例
  const stopDisplayWidth = stopSheet.width / stopFrameCount * standardScale; // 計算停止角色顯示寬度
  const effectDisplayWidth = effectSheet.width / effectFrameCount * standardScale; // 計算單格特效顯示寬度
  if (isAttacking && currentTime - attackStartedAt >= attackDuration) { // 判斷腳攻擊動畫是否已播放完畢
    isAttacking = false; // 結束一次性的腳攻擊動畫
    effectActive = true; // 啟動攻擊特效
    effectDirection = facingDirection; // 依角色目前面向設定特效方向
    effectX = characterX + effectDirection * (stopDisplayWidth + effectDisplayWidth) * 0.35; // 將特效放在角色面向的一側
    effectStartedAt = currentTime; // 記錄特效動畫開始時間
  } // 結束攻擊動畫完成處理
  const isWalking = !isAttacking && movingDirection !== 0; // 判斷角色是否正在行走
  const currentSheet = isAttacking ? attackSheet : isWalking ? walkingSheet : stopSheet; // 依角色狀態選擇攻擊、走路或停止精靈表
  const currentFrameCount = isAttacking ? attackFrameCount : isWalking ? walkingFrameCount : stopFrameCount; // 依角色狀態選擇精靈格數
  const frameWidth = currentSheet.width / currentFrameCount; // 依精靈表總寬計算單格寬度
  const frameHeight = currentSheet.height; // 取得單格圖片高度
  const scaleFactor = min(height * 0.75 / frameHeight, width * 0.9 / frameWidth); // 依畫布高寬等比例縮放並避免超出畫面
  const displayWidth = frameWidth * scaleFactor; // 計算角色顯示寬度
  const displayHeight = frameHeight * scaleFactor; // 計算角色顯示高度
  const frameIndex = isAttacking ? min(floor((currentTime - attackStartedAt) / 1000 * animationSpeed), currentFrameCount - 1) : floor(currentTime / 1000 * animationSpeed) % currentFrameCount; // 攻擊只播放一次，其餘動畫循環播放
  const sourceX = frameIndex * frameWidth; // 計算動畫格在精靈表中的水平位置
  if (isWalking) { // 按住方向鍵時更新角色位置與面向
    facingDirection = movingDirection; // 讓角色轉向目前移動方向
    characterX += movingDirection * width * 0.45 * deltaTime / 1000; // 依畫布寬度與時間間隔平順移動
  } // 結束行走狀態處理
  characterX = constrain(characterX, displayWidth / 2, width - displayWidth / 2); // 限制角色不超出畫布左右邊界
  if (effectActive) { // 特效啟動時持續朝畫布邊緣移動
    effectX += effectDirection * width * 0.7 * deltaTime / 1000; // 依方向與畫布寬度更新特效位置
    if (effectX <= 0 || effectX >= width) { // 判斷特效是否已抵達畫布左右邊緣
      effectActive = false; // 抵達畫布邊緣後移除特效
    } // 結束特效邊界判斷
  } // 結束特效移動處理
  push(); // 暫存目前的繪圖座標與縮放狀態
  translate(characterX, height - displayHeight / 2); // 將角色中心放在目前水平位置與畫布底端
  scale(facingDirection, 1); // 依角色面向翻轉圖片
  image(currentSheet, 0, 0, displayWidth, displayHeight, sourceX, 0, frameWidth, frameHeight); // 繪製目前精靈表中的動畫格
  pop(); // 還原繪圖座標與縮放狀態
  if (effectActive) { // 特效仍在畫布內時繪製特效動畫
    const effectFrameWidth = effectSheet.width / effectFrameCount; // 計算特效精靈表單格寬度
    const effectFrameHeight = effectSheet.height; // 取得特效精靈表高度
    const effectFrameIndex = floor((currentTime - effectStartedAt) / 1000 * animationSpeed) % effectFrameCount; // 循環選取特效動畫格
    const effectSourceX = effectFrameIndex * effectFrameWidth; // 計算特效動畫格在精靈表中的水平位置
    const effectDisplayHeight = effectFrameHeight * standardScale; // 依角色縮放比例計算特效顯示高度
    push(); // 暫存特效的繪圖座標與縮放狀態
    translate(effectX, height - displayHeight * 0.55); // 將特效放在角色前方的踢擊高度
    scale(effectDirection, 1); // 讓特效朝角色面向方向翻轉
    image(effectSheet, 0, 0, effectDisplayWidth, effectDisplayHeight, effectSourceX, 0, effectFrameWidth, effectFrameHeight); // 繪製目前特效精靈格
    pop(); // 還原特效繪圖座標與縮放狀態
  } // 結束特效繪製處理
} // 結束繪圖函式

function keyPressed() { // 處理方向鍵與空白鍵輸入
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) { // 檢查是否按下左右方向鍵
    return false; // 停止方向鍵的瀏覽器預設行為
  } // 結束方向鍵判斷
  if (keyCode === 32) { // 檢查是否按下空白鍵
    if (!spacePressed && !isAttacking) { // 避免長按或攻擊播放中重複觸發
      isAttacking = true; // 開始播放一次腳攻擊動畫
      attackStartedAt = millis(); // 記錄腳攻擊動畫開始時間
    } // 結束攻擊觸發條件
    spacePressed = true; // 記錄空白鍵目前已按下
    return false; // 停止空白鍵的瀏覽器預設捲動行為
  } // 結束空白鍵判斷
} // 結束鍵盤事件處理

function keyReleased() { // 允許空白鍵放開後再次觸發攻擊
  if (keyCode === 32) { // 檢查是否放開空白鍵
    spacePressed = false; // 重設空白鍵按下狀態
    return false; // 停止空白鍵放開時的瀏覽器預設行為
  } // 結束空白鍵放開處理
} // 結束鍵盤放開事件處理

function windowResized() { // 視窗尺寸改變時重新調整畫布
  const previousWidth = width; // 記錄調整前的畫布寬度
  resizeCanvas(windowWidth, windowHeight); // 讓畫布持續填滿目前視窗
  characterX = characterX * width / previousWidth; // 依新舊寬度比例調整角色位置
} // 結束視窗縮放處理
