// --- 1. Global State & Categories ---
const categories = [
    { id: 'ones', label: 'Ones', section: 'upper', options: [0, 1, 2, 3, 4, 5] },
    { id: 'twos', label: 'Twos', section: 'upper', options: [0, 2, 4, 6, 8, 10] },
    { id: 'threes', label: 'Threes', section: 'upper', options: [0, 3, 6, 9, 12, 15] },
    { id: 'fours', label: 'Fours', section: 'upper', options: [0, 4, 8, 12, 16, 20] },
    { id: 'fives', label: 'Fives', section: 'upper', options: [0, 5, 10, 15, 20, 25] },
    { id: 'sixes', label: 'Sixes', section: 'upper', options: [0, 6, 12, 18, 24, 30] },
    { id: 'upper_sum', label: 'Upper Sum', section: 'upper_calc', isCalc: true },
    { id: 'bonus', label: 'Bonus (35)', section: 'upper_calc', isCalc: true },
    { id: 'upper_total', label: 'Upper Total', section: 'upper_calc', isCalc: true },
    { id: 'three_kind', label: '3 of a Kind', section: 'lower', options: [0, 5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30] },
    { id: 'four_kind', label: '4 of a Kind', section: 'lower', options: [0, 5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30] },
    { id: 'full_house', label: 'Full House (25)', section: 'lower', options: [0, 25] },
    { id: 'sm_straight', label: 'Sm. Straight (30)', section: 'lower', options: [0, 30] },
    { id: 'lg_straight', label: 'Lg. Straight (40)', section: 'lower', options: [0, 40] },
    { id: 'yacht', label: 'YACHT (50)', section: 'lower', options: [0, 50] },
    { id: 'yacht_bonus', label: 'Yacht Bonus', section: 'lower', options: [0, 100, 200, 300] },
    { id: 'chance', label: 'Chance', section: 'lower', options: [0, 5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30] },
    { id: 'lower_total', label: 'Lower Total', section: 'lower_calc', isCalc: true },
    { id: 'grand_total', label: 'GRAND TOTAL', section: 'grand_calc', isCalc: true }
];

let players = [];
let isScoreOnly = false; 
let optimizerEnabled = true; 
let currentRound = 1;

try { 
    players = JSON.parse(localStorage.getItem('yachtPlayers')) || []; 
    isScoreOnly = JSON.parse(localStorage.getItem('yachtScoreOnly')) || false;
    currentRound = JSON.parse(localStorage.getItem('yachtRound')) || 1;
    const storedOpt = localStorage.getItem('yachtOptimizer');
    if (storedOpt !== null) optimizerEnabled = JSON.parse(storedOpt);
} catch (e) {}

let diceValues = [1, 1, 1, 1, 1];
let heldDice = [false, false, false, false, false];
let rollsLeft = 3;
const unicodeDice = ['-', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']; 
let diceView = 'numbers'; 

// --- 2. Setup Screen & View Routing ---
function toggleViews() {
    const setupDiv = document.getElementById('setup-container');
    const gameDiv = document.getElementById('game-container');
    const headerControls = document.getElementById('header-controls');
    const diceContainer = document.querySelector('.dice-container');

    if (players.length === 0) {
        setupDiv.style.display = 'block';
        gameDiv.style.display = 'none';
        headerControls.style.display = 'none'; 
        renderSetupUI();
    } else {
        setupDiv.style.display = 'none';
        gameDiv.style.display = 'block';
        headerControls.style.display = 'flex'; 
        diceContainer.style.display = isScoreOnly ? 'none' : 'block';

        const optBtn = document.getElementById('toggle-opt-btn');
        if (optBtn) optBtn.innerText = optimizerEnabled ? 'Opt: ON' : 'Opt: OFF';

        renderTable();
        updateDiceUI();
    }
}

function renderSetupUI() {
    const setupDiv = document.getElementById('setup-container');
    setupDiv.innerHTML = `
        <h2>Welcome to Disqo's Yacht Game</h2>
        <p class="subtitle">Use to score or play!</p>
        <div class="player-count-row">
            <label for="player-count">How many players?</label>
            <select id="player-count" onchange="generateNameInputs()">
                <option value="1" selected>1 Player</option>
                <option value="2">2 Players</option>
                <option value="3">3 Players</option>
                <option value="4">4 Players</option>
                <option value="5">5 Players</option>
                <option value="6">6 Players</option>
            </select>
        </div>
        <div id="name-inputs-container"></div>
        <div class="checkbox-row">
            <input type="checkbox" id="optimizer-toggle" ${optimizerEnabled ? 'checked' : ''}>
            <label for="optimizer-toggle">Enable Score Optimizer (🎯)</label>
        </div>
        <button id="start-game-btn" onclick="startGame(false)">Start Game</button>
        <button id="score-only-btn" onclick="startGame(true)">Score Card Only</button>
    `;
    generateNameInputs(); 
}

window.generateNameInputs = function() {
    const count = parseInt(document.getElementById('player-count').value, 10);
    const container = document.getElementById('name-inputs-container');
    let html = '';
    for (let i = 1; i <= count; i++) {
        html += `<div class="setup-group"><input type="text" id="setup-name-${i}" placeholder="Player ${i} Name" autocomplete="off"></div>`;
    }
    container.innerHTML = html;
};

window.startGame = function(scoreOnlyMode) {
    const count = parseInt(document.getElementById('player-count').value, 10);
    players = []; 
    isScoreOnly = scoreOnlyMode; 
    currentRound = 1;
    
    const toggleEl = document.getElementById('optimizer-toggle');
    if (toggleEl) optimizerEnabled = toggleEl.checked;
    
    for (let i = 1; i <= count; i++) {
        const input = document.getElementById(`setup-name-${i}`);
        let name = input.value.trim();
        if (!name) name = `Player ${i}`; 
        players.push({ name, scores: {} });
    }
    saveState();
    resetDice();
    toggleViews();
};

// --- 3. Math Engine ---
function getPossibleScores(dice) {
    if (rollsLeft === 3) return {};
    const counts = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0};
    let sum = 0;
    dice.forEach(d => { counts[d]++; sum += d; });
    const scores = {};
    scores.ones = counts[1] * 1; scores.twos = counts[2] * 2; scores.threes = counts[3] * 3;
    scores.fours = counts[4] * 4; scores.fives = counts[5] * 5; scores.sixes = counts[6] * 6;
    const has3 = Object.values(counts).some(c => c >= 3);
    const has4 = Object.values(counts).some(c => c >= 4);
    const has5 = Object.values(counts).some(c => c === 5);
    const has2 = Object.values(counts).some(c => c === 2);
    scores.three_kind = has3 ? sum : 0;
    scores.four_kind = has4 ? sum : 0;
    scores.full_house = ((has3 && has2) || has5) ? 25 : 0; 
    scores.yacht = has5 ? 50 : 0;
    scores.yacht_bonus = has5 ? 100 : 0;
    scores.chance = sum;
    const uniqueDice = [...new Set(dice)].sort((a,b) => a-b);
    const straightStr = uniqueDice.join('');
    scores.sm_straight = /1234|2345|3456/.test(straightStr) ? 30 : 0;
    scores.lg_straight = /12345|23456/.test(straightStr) ? 40 : 0;
    return scores;
}

// --- 4. Core Logic & Rendering ---
function saveState() {
    try { 
        localStorage.setItem('yachtPlayers', JSON.stringify(players)); 
        localStorage.setItem('yachtScoreOnly', JSON.stringify(isScoreOnly)); 
        localStorage.setItem('yachtOptimizer', JSON.stringify(optimizerEnabled)); 
        localStorage.setItem('yachtRound', JSON.stringify(currentRound));
    } catch (e) {}
}

function renderTable() {
    const table = document.getElementById('score-table');
    const possibleScores = (rollsLeft < 3) ? getPossibleScores(diceValues) : {};
    
    // BUILD HEADER
    let html = '<thead><tr><th>Category</th>';
    players.forEach((p, index) => {
        // Wrapped name in a span for better alignment when sticky
        html += `<th><span>${p.name}</span><br><button onclick="removePlayer(${index})">Remove</button></th>`;
    });
    html += '</tr></thead>';

    // BUILD BODY
    html += '<tbody>';
    categories.forEach(cat => {
        const rowClass = cat.isCalc ? 'total-row' : 'category-row';
        html += `<tr class="${rowClass}"><td>${cat.label}</td>`;
        players.forEach((p, pIndex) => {
            if (cat.isCalc) {
                html += `<td id="calc-${pIndex}-${cat.id}">${p.scores[cat.id] || 0}</td>`;
            } else {
                let optionsHtml = `<option value=""></option>`; 
                const possibleScore = possibleScores[cat.id];
                const currentScore = p.scores[cat.id];
                const isLocked = (!isScoreOnly && rollsLeft === 3);

                if (!isScoreOnly && rollsLeft < 3) {
                    if (currentScore !== undefined) {
                        optionsHtml += `<option value="${currentScore}" selected>${currentScore}</option>`;
                    } else {
                        const displayVal = (optimizerEnabled && possibleScore > 0) ? `🎯 ${possibleScore}` : possibleScore;
                        optionsHtml += `<option value="${possibleScore}">${displayVal}</option>`;
                    }
                } else {
                    cat.options.forEach(opt => {
                        const selected = currentScore === opt ? 'selected' : '';
                        optionsHtml += `<option value="${opt}" ${selected}>${opt}</option>`;
                    });
                }
                
                const shouldHighlight = (optimizerEnabled && !isScoreOnly && rollsLeft < 3 && currentScore === undefined && possibleScore > 0);
                const selectStyle = shouldHighlight ? 'background-color: #e8f4f8; border-color: #000; font-weight: bold;' : '';
                const disabledAttr = isLocked ? 'disabled' : '';
                
                html += `<td><select ${disabledAttr} onchange="updateScore(${pIndex}, '${cat.id}', this.value)" style="${selectStyle}">${optionsHtml}</select></td>`;
            }
        });
        html += '</tr>';
    });
    html += '</tbody>';
    
    table.innerHTML = html;
    calculateTotals();
}

window.updateScore = function(playerIndex, categoryId, value) {
    if (value === "") delete players[playerIndex].scores[categoryId];
    else players[playerIndex].scores[categoryId] = parseInt(value, 10);
    
    const totalScoresEntered = players.reduce((sum, p) => sum + Object.keys(p.scores).filter(k => !categories.find(c => c.id === k).isCalc).length, 0);
    const expectedScores = currentRound * players.length;

    if (totalScoresEntered >= expectedScores) {
        if (currentRound < 13) currentRound++;
        else handleGameOver();
    }

    saveState();
    calculateTotals();
    if (!isScoreOnly) resetDice(); 
    else renderTable();
};

function handleGameOver() {
    saveState();
    renderTable();
    let winner = players[0];
    players.forEach(p => { if (p.scores.grand_total > winner.scores.grand_total) winner = p; });
    setTimeout(() => {
        alert(`GAME OVER!\nWinner: ${winner.name} with ${winner.scores.grand_total} points.`);
    }, 500);
}

window.removePlayer = function(index) {
    players.splice(index, 1);
    saveState();
    toggleViews(); 
};

function calculateTotals() {
    players.forEach((p, index) => {
        let upperSum = 0;
        ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].forEach(id => { upperSum += p.scores[id] || 0; });
        const bonus = upperSum >= 63 ? 35 : 0;
        const upperTotal = upperSum + bonus;
        let lowerSum = 0;
        ['three_kind', 'four_kind', 'full_house', 'sm_straight', 'lg_straight', 'yacht', 'yacht_bonus', 'chance'].forEach(id => { lowerSum += p.scores[id] || 0; });
        p.scores.upper_sum = upperSum; p.scores.bonus = bonus; p.scores.upper_total = upperTotal;
        p.scores.lower_total = lowerSum; p.scores.grand_total = upperTotal + lowerSum;

        if (document.getElementById(`calc-${index}-upper_sum`)) {
            document.getElementById(`calc-${index}-upper_sum`).innerText = upperSum;
            document.getElementById(`calc-${index}-bonus`).innerText = bonus;
            document.getElementById(`calc-${index}-upper_total`).innerText = upperTotal;
            document.getElementById(`calc-${index}-lower_total`).innerText = lowerSum;
            document.getElementById(`calc-${index}-grand_total`).innerText = p.scores.grand_total;
        }
    });
}

// --- 5. Dice Roller UI & Actions ---
window.toggleDiceView = function() {
    diceView = (diceView === 'numbers') ? 'dice' : 'numbers';
    const viewBtn = document.getElementById('toggle-view-btn');
    if (viewBtn) viewBtn.innerText = (diceView === 'numbers') ? 'View: Dice' : 'View: Numbers';
    updateDiceUI();
};

function updateDiceUI() {
    for (let i = 0; i < 5; i++) {
        const dieEl = document.getElementById(`die-${i}`);
        if (!dieEl) continue;
        if (rollsLeft === 3 && !heldDice[i]) dieEl.innerText = '-';
        else dieEl.innerText = (diceView === 'numbers') ? diceValues[i] : unicodeDice[diceValues[i]];
        if (heldDice[i]) dieEl.classList.add('held');
        else dieEl.classList.remove('held');
    }

    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
        if (!isScoreOnly && rollsLeft === 3) {
            statusBar.style.display = 'block';
            statusBar.classList.add('error');
            statusBar.innerText = "Roll dice to add score!";
        } else if (currentRound > 13) {
            statusBar.style.display = 'block';
            statusBar.classList.remove('error');
            statusBar.innerText = "GAME OVER!";
        } else {
            statusBar.style.display = 'none';
        }
    }

    const rollsEl = document.getElementById('rolls-left');
    if (rollsEl) rollsEl.innerText = `Round: ${currentRound}/13 | Rolls left: ${rollsLeft}`;
    const rollBtn = document.getElementById('roll-btn');
    if (rollBtn) rollBtn.disabled = (rollsLeft === 0 || currentRound > 13);
}

window.toggleHold = function(index) {
    if (rollsLeft === 3) return; 
    heldDice[index] = !heldDice[index];
    updateDiceUI();
};

// --- 6. Initialization & Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // We attach the listener directly to the button by ID
    const rollBtn = document.getElementById('roll-btn');
    if (rollBtn) {
        rollBtn.addEventListener('click', () => {
            if (rollsLeft > 0 && currentRound <= 13) {
                for (let i = 0; i < 5; i++) {
                    if (!heldDice[i]) diceValues[i] = Math.floor(Math.random() * 6) + 1;
                }
                rollsLeft--;
                updateDiceUI();
                renderTable(); 
            }
        });
    }

    const resetBtn = document.getElementById('reset-btn');
    let resetTapCount = 0;
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            if (resetTapCount === 0) {
                e.target.innerText = "Sure?";
                e.target.style.background = "#ffcccc";
                resetTapCount++;
                setTimeout(() => {
                    e.target.innerText = "Reset";
                    e.target.style.background = "var(--bg-white)";
                    resetTapCount = 0;
                }, 3000);
            } else {
                players = []; 
                currentRound = 1;
                saveState();
                resetDice();
                toggleViews(); 
                e.target.innerText = "Reset";
                e.target.style.background = "var(--bg-white)";
                resetTapCount = 0;
            }
        });
    }

    toggleViews();
});

window.toggleOptimizer = function() {
    optimizerEnabled = !optimizerEnabled;
    saveState(); 
    const optBtn = document.getElementById('toggle-opt-btn');
    if (optBtn) optBtn.innerText = optimizerEnabled ? 'Opt: ON' : 'Opt: OFF';
    renderTable(); 
};

window.resetDice = function() {
    heldDice = [false, false, false, false, false];
    rollsLeft = 3;
    updateDiceUI();
    if(players.length > 0) renderTable();
};