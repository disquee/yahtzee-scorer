// --- 1. Global State ---
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

let players = [], isScoreOnly = false, optimizerEnabled = true, currentRound = 1;
let diceValues = [1, 1, 1, 1, 1], heldDice = [false, false, false, false, false], rollsLeft = 3;
const unicodeDice = ['-', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']; 

// Load persistent state
try { 
    players = JSON.parse(localStorage.getItem('yachtPlayers')) || []; 
    isScoreOnly = JSON.parse(localStorage.getItem('yachtScoreOnly')) || false;
    currentRound = JSON.parse(localStorage.getItem('yachtRound')) || 1;
    const storedOpt = localStorage.getItem('yachtOptimizer');
    if (storedOpt !== null) optimizerEnabled = JSON.parse(storedOpt);
} catch (e) {}

// --- 2. Setup Mode ---
function renderSetupUI() {
    const setupDiv = document.getElementById('setup-container');
    setupDiv.innerHTML = `
        <h2>WELCOME TO DISQO'S YACHT GAME</h2>
        <p class="subtitle">Use to score or play!</p>
        <div class="player-count-row">
            <label for="player-count">HOW MANY PLAYERS?</label>
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
        <div class="checkbox-row" style="display:flex; align-items:center; gap:0.8rem; margin: 1.5rem 0;">
            <input type="checkbox" id="optimizer-toggle" ${optimizerEnabled ? 'checked' : ''} style="appearance:auto; width:1.2rem; height:1.2rem;">
            <label for="optimizer-toggle" style="font-family:var(--font-mono); font-size:0.9rem; text-transform:uppercase;">Enable Score Optimizer (🎯)</label>
        </div>
        <button id="start-game-btn" onclick="startGame(false)">START GAME</button>
        <button id="score-only-btn" onclick="startGame(true)">SCORE CARD ONLY</button>
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

window.startGame = function(mode) {
    const count = parseInt(document.getElementById('player-count').value, 10);
    players = []; isScoreOnly = mode; currentRound = 1;
    const toggleEl = document.getElementById('optimizer-toggle');
    if (toggleEl) optimizerEnabled = toggleEl.checked;
    for (let i = 1; i <= count; i++) {
        players.push({ name: document.getElementById(`setup-name-${i}`).value.trim() || `Player ${i}`, scores: {} });
    }
    saveState(); toggleViews();
};

// --- 3. View Routing & HUD ---
function toggleViews() {
    const setupDiv = document.getElementById('setup-container');
    const gameDiv = document.getElementById('game-container');
    const headerControls = document.getElementById('header-controls');
    const diceContainer = document.querySelector('.dice-container');
    if (players.length === 0) {
        setupDiv.style.display = 'block'; gameDiv.style.display = 'none'; headerControls.style.display = 'none';
        renderSetupUI();
    } else {
        setupDiv.style.display = 'none'; gameDiv.style.display = 'block'; headerControls.style.display = 'flex';
        diceContainer.style.display = isScoreOnly ? 'none' : 'block';
        
        // Sync header button text
        const optBtn = document.getElementById('toggle-opt-btn');
        if (optBtn) optBtn.innerText = optimizerEnabled ? 'Opt: ON' : 'Opt: OFF';

        renderTable(); updateDiceUI();
    }
}

function updateDiceUI() {
    for (let i = 0; i < 5; i++) {
        const el = document.getElementById(`die-${i}`);
        if (!el) continue;
        el.innerText = (rollsLeft === 3 && !heldDice[i]) ? '-' : unicodeDice[diceValues[i]];
        el.className = `die ${heldDice[i] ? 'held' : ''}`;
    }
    const sb = document.getElementById('status-bar');
    if (sb) sb.style.display = (!isScoreOnly && rollsLeft === 3) ? 'block' : 'none';
    const rEl = document.getElementById('rolls-left');
    if (rEl) rEl.innerText = `ROUND: ${currentRound}/13 | ROLLS LEFT: ${rollsLeft}`;
    const rBtn = document.getElementById('roll-btn');
    if (rBtn) rBtn.disabled = (rollsLeft === 0 || currentRound > 13);
    updateStickyOffsets();
}

// --- 4. Core Logic ---
function renderTable() {
    const table = document.getElementById('score-table');
    const possibleScores = (rollsLeft < 3) ? getPossibleScores(diceValues) : {};
    let html = '<thead><tr><th>Category</th>';
    players.forEach((p, index) => html += `<th>${p.name}<br><button onclick="removePlayer(${index})" style="font-size:0.7rem; padding:2px 5px;">Remove</button></th>`);
    html += '</tr></thead><tbody>';

    categories.forEach(cat => {
        const rowClass = cat.isCalc ? 'total-row' : 'category-row';
        html += `<tr class="${rowClass}"><td>${cat.label}</td>`;
        players.forEach((p, pIdx) => {
            if (cat.isCalc) {
                html += `<td id="calc-${pIdx}-${cat.id}">${p.scores[cat.id] || 0}</td>`;
            } else {
                const possible = possibleScores[cat.id], current = p.scores[cat.id], isLocked = (!isScoreOnly && rollsLeft === 3);
                let optHtml = `<option value=""></option>`; 
                if (!isScoreOnly && rollsLeft < 3) {
                    if (current !== undefined) optHtml += `<option value="${current}" selected>${current}</option>`;
                    // Only show 🎯 suggestion if optimizerEnabled is true
                    else optHtml += `<option value="${possible}">${(optimizerEnabled && possible > 0) ? `🎯 ${possible}` : possible}</option>`;
                } else {
                    cat.options.forEach(o => optHtml += `<option value="${o}" ${current === o ? 'selected' : ''}>${o}</option>`);
                }
                // Only show blue background highlight if optimizerEnabled is true
                const style = (optimizerEnabled && !isScoreOnly && rollsLeft < 3 && current === undefined && possible > 0) ? 'background:#e8f4f8; font-weight:bold;' : '';
                html += `<td><select ${isLocked ? 'disabled' : ''} onchange="updateScore(${pIdx}, '${cat.id}', this.value)" style="${style}">${optHtml}</select></td>`;
            }
        });
        html += '</tr>';
    });
    table.innerHTML = html + '</tbody>';
    calculateTotals();
    updateStickyOffsets();
}

window.updateScore = function(pIdx, catId, val) {
    if (val === "") delete players[pIdx].scores[catId];
    else players[pIdx].scores[catId] = parseInt(val, 10);
    const total = players.reduce((s, p) => s + Object.keys(p.scores).filter(k => !categories.find(c => c.id === k).isCalc).length, 0);
    if (total >= currentRound * players.length && currentRound < 13) currentRound++;
    saveState(); calculateTotals();
    if (!isScoreOnly) resetDice(); else renderTable();
};

function calculateTotals() {
    players.forEach((p, index) => {
        let uSum = 0; ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].forEach(id => uSum += p.scores[id] || 0);
        let lSum = 0; ['three_kind', 'four_kind', 'full_house', 'sm_straight', 'lg_straight', 'yacht', 'yacht_bonus', 'chance'].forEach(id => lSum += p.scores[id] || 0);
        p.scores.upper_sum = uSum; p.scores.bonus = uSum >= 63 ? 35 : 0; p.scores.upper_total = uSum + p.scores.bonus;
        p.scores.lower_total = lSum; p.scores.grand_total = p.scores.upper_total + lSum;
        ['upper_sum', 'bonus', 'upper_total', 'lower_total', 'grand_total'].forEach(id => {
            const el = document.getElementById(`calc-${index}-${id}`); if (el) el.innerText = p.scores[id];
        });
    });
}

function getPossibleScores(dice) {
    if (rollsLeft === 3) return {};
    const counts = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0};
    let sum = 0; dice.forEach(d => { counts[d]++; sum += d; });
    const s = {};
    s.ones = counts[1] * 1; s.twos = counts[2] * 2; s.threes = counts[3] * 3;
    s.fours = counts[4] * 4; s.fives = counts[5] * 5; s.sixes = counts[6] * 6;
    const has3 = Object.values(counts).some(c => c >= 3), has4 = Object.values(counts).some(c => c >= 4), has5 = Object.values(counts).some(c => c === 5), has2 = Object.values(counts).some(c => c === 2);
    s.three_kind = has3 ? sum : 0; s.four_kind = has4 ? sum : 0; s.full_house = ((has3 && has2) || has5) ? 25 : 0; s.yacht = has5 ? 50 : 0; s.yacht_bonus = has5 ? 100 : 0; s.chance = sum;
    const unique = [...new Set(dice)].sort((a,b) => a-b).join('');
    s.sm_straight = /1234|2345|3456/.test(unique) ? 30 : 0; s.lg_straight = /12345|23456/.test(unique) ? 40 : 0;
    return s;
}

// Sticky Offsets for the layer-cake HUD
function updateStickyOffsets() {
    const diceHUD = document.querySelector('.dice-container'), sb = document.getElementById('status-bar'), ths = document.querySelectorAll('#score-table thead th');
    if (!diceHUD || isScoreOnly || diceHUD.style.display === 'none') return;
    const h = diceHUD.offsetHeight;
    if (sb && sb.style.display !== 'none') {
        sb.style.top = `${h - 3}px`;
        const combined = h + sb.offsetHeight - 6;
        ths.forEach(th => th.style.top = `${combined}px`);
    } else {
        ths.forEach(th => th.style.top = `${h - 3}px`);
    }
}

// --- 5. Listeners & Global Helpers ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('roll-btn').addEventListener('click', () => {
        if (rollsLeft > 0 && currentRound <= 13) {
            for (let i = 0; i < 5; i++) if (!heldDice[i]) diceValues[i] = Math.floor(Math.random() * 6) + 1;
            rollsLeft--; updateDiceUI(); renderTable(); 
        }
    });
    document.getElementById('reset-btn').addEventListener('click', () => { 
        players = []; currentRound = 1; saveState(); resetDice(); toggleViews(); 
    });
    toggleViews();
    window.addEventListener('resize', updateStickyOffsets);
});

window.toggleOptimizer = () => { 
    optimizerEnabled = !optimizerEnabled; 
    saveState(); 
    const optBtn = document.getElementById('toggle-opt-btn');
    if (optBtn) optBtn.innerText = optimizerEnabled ? 'Opt: ON' : 'Opt: OFF';
    renderTable(); 
};

window.toggleHold = (i) => { if (rollsLeft < 3) { heldDice[i] = !heldDice[i]; updateDiceUI(); } };
window.resetDice = () => { heldDice = [false, false, false, false, false]; rollsLeft = 3; updateDiceUI(); if(players.length > 0) renderTable(); };
window.removePlayer = (i) => { players.splice(i, 1); saveState(); toggleViews(); };
function saveState() { localStorage.setItem('yachtPlayers', JSON.stringify(players)); localStorage.setItem('yachtScoreOnly', JSON.stringify(isScoreOnly)); localStorage.setItem('yachtOptimizer', JSON.stringify(optimizerEnabled)); localStorage.setItem('yachtRound', JSON.stringify(currentRound)); }