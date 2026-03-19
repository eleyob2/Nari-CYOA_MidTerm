// Element reference
const p1 = document.getElementById("paragraph1");
const p2 = document.getElementById("paragraph2");
const p3 = document.getElementById("paragraph3");

const nextBtn = document.getElementById("nextParagraphButton");
const choiceABtn = document.getElementById("choiceAButton");
const choiceBBtn = document.getElementById("choiceBButton");
const reviewCluesBtn = document.getElementById("reviewCluesButton");
const imageEl = document.getElementById("story-image");

const healthDisplay = document.getElementById("healthDisplay");
const intelDisplay = document.getElementById("intelDisplay");
const inventoryList = document.getElementById("inventoryList");
const journalDiv = document.getElementById("journal");

const tooltip = document.getElementById("tooltip");
const codeInput = document.getElementById("codeInput");
const submitCodeButton = document.getElementById("submitCodeButton");
const codeMessage = document.getElementById("codeMessage");

const playerNameInput = document.getElementById("playerNameInput");
const setNameButton = document.getElementById("setNameButton");

// Game state variables
let currentScene = "node1";
let paragraphIndex = 0;
let health = 100;
let intel = 0;
let inventory = [];
let clues = [];
let countdownTime = 10;
let countdownInterval = null;
const correctCode = "2035";
let secretUnlocked = false;
let playerName = "Lt. Arman Reyes";

//story scenes
const scenes = {
  node1: [
    "Tehran Under Siege.",
    "You are a young Iranian-American combat medic in a UN peacekeeping unit during year 15 of the war.",
    "Do you go to the front lines to document atrocities or stay in the capital to support protests and hospitals?"
  ],
  node2: [
    "Road to the Front.",
    "Your convoy is hit outside a ruined city, civilians and soldiers are mixed in chaos.",
    "Prioritize wounded soldiers for combat effectiveness, or prioritize civilians despite the commander?"
  ],
  node3: [
    "Streets of Protest.",
    "Massive anti-war marches fill Tehran; foreign media drones broadcast banners calling it a war of choice.",
    "Help organizers plan a general strike, or secretly pass medical supplies to underground militias?"
  ],
  node4: [
    "Obey the Chain of Command.",
    "Your efficiency saves your unit, but leaked videos show you stepping over dying civilians.",
    "Do you publicly defend your actions, or express guilt and ask to be reassigned to humanitarian duty?"
  ],
  node5: [
    "Break Orders for Civilians.",
    "You save children but several soldiers die; you are arrested for insubordination.",
    "Accept court-martial and become a symbol, or agree to amnesty by joining a black-ops team?"
  ],
  node6: [
    "Building the General Strike.",
    "The strike could shut down the country but risks brutal crackdowns.",
    "Push for an immediate nationwide strike, or argue for a phased, limited strike?"
  ],
  node7: [
    "Arming the Resistance.",
    "Militias want your help sabotaging a military AI logistics hub that keeps the war supplied.",
    "Help plan the sabotage, or refuse to militarize and stick to aid?"
  ],
  ending8A: [
    "Hero of the War Machine",
    "War drags on; you rise in rank and are branded a loyal officer who prolonged slaughter.",
    "(Ending 1)"
  ],
  ending8B: [
    "Burned-Out Healer",
    "You transfer to a refugee camp; war continues, but you save thousands and withdraw from politics.",
    "(Ending 2)"
  ],
  ending8C: [
    "Prisoner of Conscience",
    "Your trial sparks global outrage; anti-war protests surge and a ceasefire begins two years later.",
    "(Ending 3)"
  ],
  ending8D: [
    "Ghost of the Border",
    "A black-ops team destroys command bunkers; a rushed dirty peace leaves the region shattered.",
    "(Ending 4)"
  ],
  ending9A: [
    "Blood on the Pavement",
    "The total strike triggers a crackdown; thousands die, but the world imposes an arms embargo.",
    "(Ending 5)"
  ],
  ending9B: [
    "Slow Thaw",
    "Limited strikes grow into a huge movement; elections bring anti-war leaders and a gradual end.",
    "(Ending 6)"
  ],
  ending9C: [
    "Fire in the Circuits",
    "The AI logistics hub is crippled; exhaustion leads to a fragile UN-brokered peace.",
    "(Ending 7)"
  ],
  ending9D: [
    "The War That Faded",
    "You keep the movement nonviolent; public opinion turns, funding dries up, and war withers.",
    "(Ending 8)"
  ]
};

const nodeChoices = {
  node1: ["Go to the front lines", "Support protests and hospitals"],
  node2: ["Prioritize soldiers", "Prioritize civilians"],
  node3: ["Plan a general strike", "Pass supplies to militias"],
  node4: ["Defend actions publicly", "Ask humanitarian reassignment"],
  node5: ["Accept court martial", "Agree to black-ops amnesty"],
  node6: ["Immediate nationwide strike", "Phased limited strike"],
  node7: ["Plan sabotage", "Stick to aid"],
  ending8A: ["The End", "The End"],
  ending8B: ["The End", "The End"],
  ending8C: ["The End", "The End"],
  ending8D: ["The End", "The End"],
  ending9A: ["The End", "The End"],
  ending9B: ["The End", "The End"],
  ending9C: ["The End", "The End"],
  ending9D: ["The End", "The End"]
};

// Core functions

// Try–catch wrapper
function safeRun(action) {
  try {
    action();
  } catch (error) {
    logEvent("HUD ERROR: " + error.message);
    console.error(error);
  }
}

// Display scene, replacing {NAME}
function setChoiceButtons(sceneName) {
  const choices = nodeChoices[sceneName];
  const isEnding = sceneName.startsWith("ending") || sceneName === "secretEnd";

  if (isEnding) {
    choiceABtn.style.display = "none";
    choiceBBtn.style.display = "none";
    nextBtn.style.display = "none";
    reviewCluesBtn.style.display = "inline-block";
    return;
  }

  choiceABtn.style.display = "inline-block";
  choiceBBtn.style.display = "inline-block";
  nextBtn.style.display = "inline-block";
  reviewCluesBtn.style.display = "inline-block";

  if (!choices) {
    choiceABtn.textContent = "Choice A";
    choiceBBtn.textContent = "Choice B";
    choiceABtn.disabled = false;
    choiceBBtn.disabled = false;
    return;
  }
  choiceABtn.textContent = choices[0];
  choiceBBtn.textContent = choices[1];
  choiceABtn.disabled = false;
  choiceBBtn.disabled = false;
}

function displayScene(sceneName) {
  const rawLines = scenes[sceneName] || [];
  const lines = rawLines.map(line => line.replace("{NAME}", playerName));
  paragraphIndex = 0;
  p1.textContent = lines[0] || "";
  p2.textContent = lines[1] || "";
  p3.textContent = lines[2] || "";
  setChoiceButtons(sceneName);
}

// Advance paragraphs if you later add more lines
function nextParagraph() {
  const rawLines = scenes[currentScene] || [];
  const lines = rawLines.map(line => line.replace("{NAME}", playerName));

  paragraphIndex += 3;
  if (paragraphIndex < lines.length) {
    p1.textContent = lines[paragraphIndex] || "";
    p2.textContent = lines[paragraphIndex + 1] || "";
    p3.textContent = lines[paragraphIndex + 2] || "";
  } else {
    logEvent("End of this scene.");
  }
}

// Swap main image
function setImage(filename) {
  const normalized = filename.toLowerCase().replace(/\.(jpe?g|png)$/i, "");
  const imageMap = {
    "drop_ship": "drop_ship.png",
    "daybreak_map": "map.png",
    "map": "map.png",
    "broadcast": "broadcast.png",
    "streets_of_steel": "streets_of_steel.png",
    "mech_drop": "mech_drop.png",
    "alley_exo": "alley_exo.png",
    "duel_of_titans": "duel_of_titans.png",
    "collateral": "collateral.png",
    "human_shield": "human_shield.png",
    "machine_soldier": "machine_soldier.png",
    "broken_but_human": "broken_but_human.png",
    "pilot_apocalypse": "pilot_apocalypse.png",
    "guardian_streets": "guardian_streets.png",
    "iron_fist_peace": "iron_fist_peace.png",
    "face_of_war": "face_of_war.png",
    "martyr_metal": "martyr_metal.png",
    "prototype_above_all": "prototype_above_all.png"
  };
  const imageFile = imageMap[normalized] || "map.png";
  imageEl.src = "images/" + imageFile;
}

// HUD update
function updateHud() {
  healthDisplay.textContent = health;
  intelDisplay.textContent = intel;
}

// Inventory
function addToInventory(itemName) {
  if (!inventory.includes(itemName)) {
    inventory.push(itemName);
    const li = document.createElement("li");
    li.textContent = itemName;
    inventoryList.appendChild(li);
  }
}

// Journal log
function logEvent(text) {
  const p = document.createElement("p");
  p.textContent = text;
  journalDiv.appendChild(p);
}

// Simple damage flash
function flashDamage() {
  journalDiv.classList.add("damage");
  setTimeout(() => journalDiv.classList.remove("damage"), 500);
}

// Countdown timer
function startCountdown() {
  countdownTime = 10;
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    countdownTime--;
    logEvent("Evac timer: " + countdownTime + "s");
    if (countdownTime <= 0) {
      clearInterval(countdownInterval);
      health -= 30;
      flashDamage();
      updateHud();
      logEvent("You were too slow; artillery batters your position.");
    }
  }, 1000);
}

// Review clues (loop requirement)
function reviewClues() {
  logEvent("Reviewing mission intel:");
  for (let i = 0; i < clues.length; i++) {
    logEvent("- " + clues[i]);
  }
}

// Code submission for secret ending
function submitCode() {
  const value = codeInput.value.trim();
  if (value === correctCode && !secretUnlocked) {
    secretUnlocked = true;
    currentScene = "secretEnd";
    displayScene("secretEnd");
    setImage("broadcast.jpg");
    codeMessage.textContent = "Uplink opened. Secret broadcast in progress.";
    logEvent("You trigger the DAWNFALL-2035 uplink and leak everything.");
  } else if (value !== correctCode) {
    codeMessage.textContent = "Access denied.";
  }
}

// Branching story functions

// Node 1 (N1)
function chooseNode1A() {
  currentScene = "node2";
  displayScene("node2");
  setImage("streets_of_steel");
  logEvent("Chose: Front lines to document atrocities.");
}

function chooseNode1B() {
  currentScene = "node3";
  displayScene("node3");
  setImage("broadcast");
  logEvent("Chose: Stay in capital to support protests and hospitals.");
}

// Node 2 (N2)
function chooseNode2A() {
  currentScene = "node4";
  displayScene("node4");
  setImage("collateral");
  logEvent("Chose: Prioritize soldiers.");
}

function chooseNode2B() {
  currentScene = "node5";
  displayScene("node5");
  setImage("human_shield");
  logEvent("Chose: Prioritize civilians.");
}

// Node 3 (N3)
function chooseNode3A() {
  currentScene = "node6";
  displayScene("node6");
  setImage("face_of_war");
  logEvent("Chose: Help build general strike.");
}

function chooseNode3B() {
  currentScene = "node7";
  displayScene("node7");
  setImage("prototype_above_all");
  logEvent("Chose: Pass medical supplies secretly.");
}

// Node 4 (N4)
function chooseNode4A() {
  currentScene = "ending8A";
  displayScene("ending8A");
  setImage("iron_fist_peace");
  logEvent("ENDING REACHED: Hero of the War Machine.");
}

function chooseNode4B() {
  currentScene = "ending8B";
  displayScene("ending8B");
  setImage("broken_but_human");
  logEvent("ENDING REACHED: Burned-Out Healer.");
}

// Node 5 (N5)
function chooseNode5A() {
  currentScene = "ending8C";
  displayScene("ending8C");
  setImage("martyr_metal");
  logEvent("ENDING REACHED: Prisoner of Conscience.");
}

function chooseNode5B() {
  currentScene = "ending8D";
  displayScene("ending8D");
  setImage("duel_of_titans");
  logEvent("ENDING REACHED: Ghost of the Border.");
}

// Node 6 (N6)
function chooseNode6A() {
  currentScene = "ending9A";
  displayScene("ending9A");
  setImage("pilot_apocalypse");
  logEvent("ENDING REACHED: Blood on the Pavement.");
}

function chooseNode6B() {
  currentScene = "ending9B";
  displayScene("ending9B");
  setImage("guardian_streets");
  logEvent("ENDING REACHED: Slow Thaw.");
}

// Node 7 (N7)
function chooseNode7A() {
  currentScene = "ending9C";
  displayScene("ending9C");
  setImage("mech_drop");
  logEvent("ENDING REACHED: Fire in the Circuits.");
}

function chooseNode7B() {
  currentScene = "ending9D";
  displayScene("ending9D");
  setImage("machine_soldier");
  logEvent("ENDING REACHED: The War That Faded.");
}

// ================== INITIAL SETUP ==================
displayScene("node1");
setImage("map");
updateHud();
logEvent("Operation Dawnfall initialized.");

// ================== EVENT LISTENERS ==================

// Name input
setNameButton.addEventListener("click", () => safeRun(() => {
  const value = playerNameInput.value.trim();
  if (value.length > 0) {
    playerName = value;
    logEvent("Call sign confirmed: " + playerName + ".");
    displayScene(currentScene);
  }
}));

// 1. Next paragraph
nextBtn.addEventListener("click", () => safeRun(nextParagraph));

// 2–3. Choice A / B buttons
choiceABtn.addEventListener("click", () => safeRun(() => {
  if (currentScene === "node1")          chooseNode1A();
  else if (currentScene === "node2")     chooseNode2A();
  else if (currentScene === "node3")     chooseNode3A();
  else if (currentScene === "node4")     chooseNode4A();
  else if (currentScene === "node5")     chooseNode5A();
  else if (currentScene === "node6")     chooseNode6A();
  else if (currentScene === "node7")     chooseNode7A();
}));

choiceBBtn.addEventListener("click", () => safeRun(() => {
  if (currentScene === "node1")          chooseNode1B();
  else if (currentScene === "node2")     chooseNode2B();
  else if (currentScene === "node3")     chooseNode3B();
  else if (currentScene === "node4")     chooseNode4B();
  else if (currentScene === "node5")     chooseNode5B();
  else if (currentScene === "node6")     chooseNode6B();
  else if (currentScene === "node7")     chooseNode7B();
}));

// 4. Review clues button
reviewCluesBtn.addEventListener("click", () => safeRun(reviewClues));

// 5. Submit code button
submitCodeButton.addEventListener("click", () => safeRun(submitCode));

// 6–9. Image hover + tooltip
imageEl.addEventListener("mouseover", (event) => safeRun(() => {
  tooltip.classList.remove("hidden");
  tooltip.textContent = "Hold E to scan; press C to start evac timer.";
  tooltip.style.left = event.pageX + 10 + "px";
  tooltip.style.top = event.pageY + 10 + "px";
}));

imageEl.addEventListener("mouseout", () => safeRun(() => {
  tooltip.classList.add("hidden");
}));

imageEl.addEventListener("mouseover", () => safeRun(() => {
  imageEl.style.borderColor = "#ffea00";
}));

imageEl.addEventListener("mouseout", () => safeRun(() => {
  imageEl.style.borderColor = "#00e5ff";
}));

// 10–13. Keyboard controls
document.addEventListener("keydown", (event) => safeRun(() => {
  if (event.key === "e" || event.key === "E") {
    logEvent("You scan the area for threats and signals.");
    intel++;
    updateHud();
  }
}));

document.addEventListener("keydown", (event) => safeRun(() => {
  if (event.key === "ArrowRight") {
    nextParagraph();
  } else if (event.key === "ArrowLeft") {
    logEvent("You pause to reassess the tactical map.");
  }
}));

document.addEventListener("keydown", (event) => safeRun(() => {
  if (event.key === " ") {
    addToInventory("Spent Shell Casing");
    logEvent("You pocket a casing as evidence.");
  }
}));

document.addEventListener("keydown", (event) => safeRun(() => {
  if (event.key === "c" || event.key === "C") {
    logEvent("Evac timer engaged.");
    startCountdown();
  }
}));

// 14–16. Extra interactions
choiceABtn.addEventListener("dblclick", () => safeRun(() => {
  p1.style.color = "#ffea00";
  logEvent("Your HUD flashes a critical warning.");
}));

choiceBBtn.addEventListener("dblclick", () => safeRun(() => {
  const sound = new Audio("explosion.mp3");
  sound.play();
  health -= 5;
  flashDamage();
  updateHud();
  logEvent("A distant explosion rattles your frame.");
}));

nextBtn.addEventListener("dblclick", () => safeRun(() => {
  logEvent("Sensors detect motion in the rubble...");
  setTimeout(() => {
    logEvent("A rogue combat drone scuttles into view!");
    health -= 5;
    updateHud();
    flashDamage();
  }, 3000);
}));
