const categories = [
    { id: 'ones', label: 'ONES' }, { id: 'twos', label: 'TWOS' }, { id: 'threes', label: 'THREES' },
    { id: 'fours', label: 'FOURS' }, { id: 'fives', label: 'FIVES' }, { id: 'sixes', label: 'SIXES' },
    { id: 'upper_sum', label: 'UPPER SUM', isCalc: true }, { id: 'bonus', label: 'BONUS (35)', isCalc: true }, { id: 'upper_total', label: 'UPPER TOTAL', isCalc: true },
    { id: 'three_kind', label: '3 KIND' }, { id: 'four_kind', label: '4 KIND' }, { id: 'full_house', label: 'FULL HOUSE' },
    { id: 'sm_straight', label: 'SM STRAIGHT' }, { id: 'lg_straight', label: 'LG STRAIGHT' }, { id: 'yacht', label: 'YACHT' },
    { id: 'yacht_bonus', label: 'YACHT BONUS' }, { id: 'chance', label: 'CHANCE' },
    { id: 'lower_total', label: 'LOWER TOTAL', isCalc: true }, { id: 'grand_total', label: 'GRAND TOTAL', isCalc: true }
];

let players = [], rollsLeft = 3, currentRound = 1, optimizerEnabled = false, isScoreOnly = false;
let diceValues = [1, 1, 1, 1, 1], heldDice = [false, false, false, false, false], diceView = 'dice';
const unicodeDice = ['-', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function renderTable() {
    const head = document.getElementById('table-head');
    const body = document.getElementById('table-body');
    const possibleScores = (rollsLeft < 3) ? getPossibleScores(diceValues) : {};
    
    let hHtml = '<tr><th>CATEGORY</th>';
    players.forEach((p, i) => hHtml += `<th>${p.name}<br><button onclick="removePlayer(${i})" style="font-size:0.5rem; padding:2px 4px; margin-top:4px;">REMOVE</button></th>`);
    head.innerHTML = hHtml + '</tr>';

    let bHtml = '';
    categories.forEach(cat => {
        bHtml += `<tr class="${cat.isCalc ? 'total-row' : ''}"><td>${cat.label}</td>`;
        players.forEach((p, pIdx) => {
            if (cat.isCalc) {
                bHtml += `<td id="calc-${pIdx}-${cat.id}">${p.scores[cat.id] || 0}</td>`;
            } else {
                const possible = possibleScores[cat.id] || 0, current = p.scores[cat.id], isLocked = (!isScoreOnly && rollsLeft === 3);
                let optStyle = (optimizerEnabled && !isScoreOnly && rollsLeft < 3 && current === undefined && possible > 0) ? 'background:#beddff; color:#000; font-weight:bold;' : '';
                bHtml += `<td><select ${isLocked ? 'disabled' : ''} onchange="updateScore(${pIdx}, '${cat.id}', this.value)" style="${optStyle}">`;
                bHtml += `<option value=""></option>`;
                if (current !== undefined) bHtml += `<option value="${current}" selected>${current}</option>`;
                else if (!isScoreOnly && rollsLeft < 3) bHtml += `<option value="${possible}">${(optimizerEnabled && possible > 0) ? '✏️ ' + possible : possible}</option>`;
                else [0, 5, 10, 15, 20, 25, 30, 40, 50].forEach(v => bHtml += `<option value="${v}">${v}</option>`);
                bHtml += `</select></td>`;
            }
        });
        bHtml += '</tr>';
    });
    body.innerHTML = bHtml;
    calculateTotals();
}

function updateScore(pIdx, catId, val) {
    if (val === "") delete players[pIdx].scores[catId];
    else players[pIdx].scores[catId] = parseInt(val, 10);
    
    // Check if round should advance
    const count = players.reduce((s, p) => s + Object.keys(p.scores).filter(k => !categories.find(c => c.id === k).isCalc).length, 0);
    if (count >= currentRound * players.length && currentRound < 13) currentRound++;
    
    if (!isScoreOnly) {
        resetDice(); 
    } else { 
        // Force the UI to refresh the round counter in Score Card mode
        updateDiceUI(); 
        renderTable(); 
    }
}

function updateDiceUI() {
    const diceDisp = document.querySelector('.dice-display');
    const btnRow = document.querySelector('.dice-button-row');
    const roundStatus = document.getElementById('rolls-left');
    const sb = document.getElementById('status-bar');

    if (isScoreOnly) {
        // SCORE CARD MODE: Hide dice and buttons, show stacked typographic header
        if (diceDisp) diceDisp.style.display = 'none';
        if (btnRow) btnRow.style.display = 'none';
        if (roundStatus) {
            roundStatus.innerHTML = `
                <div style="font-size: 2rem; font-weight: bold; letter-spacing: 0.05em; margin-bottom: 0.5rem; line-height: 1;">SCORE CARD</div>
                <div style="font-size: 1rem; color: #555;">ROUND: ${currentRound}/13</div>
            `;
        }
    } else {
        // PLAY MODE: Show normal dice UI
        if (diceDisp) diceDisp.style.display = 'flex';
        if (btnRow) btnRow.style.display = 'flex';
        
        for (let i = 0; i < 5; i++) {
            const el = document.getElementById(`die-${i}`);
            if (el) {
                el.innerText = (rollsLeft === 3 && !heldDice[i]) ? '-' : (diceView === 'numbers' ? diceValues[i] : unicodeDice[diceValues[i]]);
                el.className = `die ${heldDice[i] ? 'held' : ''}`;
            }
        }
        if (roundStatus) {
            // Revert back to the single-line string for play mode
            roundStatus.innerText = `ROUND: ${currentRound}/13 | ROLLS LEFT: ${rollsLeft}`;
        }
    }

    if (sb) sb.style.display = (!isScoreOnly && rollsLeft === 3) ? 'block' : 'none';
}

function renderSetupUI() {
    document.getElementById('setup-container').innerHTML = `
        <div class="setup-container">
            <h2>WELCOME TO DISQO'S YACHT PARTY</h2>
            <div class="player-count-row"><label>HOW MANY PLAYERS?</label>
                <select id="player-count" onchange="generateNameInputs()">
                    <option value="1">1 Player</option><option value="2">2 Players</option>
                    <option value="3">3 Players</option><option value="4">4 Players</option>
                    <option value="5">5 Players</option><option value="6">6 Players</option>
                </select>
            </div>
            <div id="name-inputs-container"></div>
            <button id="start-game-btn" onclick="startGame(false)">START GAME</button>
            <button id="score-only-btn" onclick="startGame(true)">SCORE CARD ONLY</button>
        </div>`;
    generateNameInputs();
}

window.generateNameInputs = () => {
    const c = document.getElementById('player-count').value;
    let h = ''; for (let i = 1; i <= c; i++) h += `<div class="setup-group"><input type="text" id="setup-name-${i}" placeholder="Player ${i} Name"></div>`;
    document.getElementById('name-inputs-container').innerHTML = h;
};

window.startGame = (mode) => {
    const c = document.getElementById('player-count').value;
    players = [];
    for (let i = 1; i <= c; i++) players.push({ name: document.getElementById(`setup-name-${i}`).value || `PLAYER ${i}`, scores: {} });
    isScoreOnly = mode; toggleViews();
};

function toggleViews() {
    const s = document.getElementById('setup-container');
    const g = document.getElementById('game-container');
    const h = document.getElementById('header-controls');
    const resetBtn = document.getElementById('reset-btn');
    
    if (players.length === 0) { 
        s.style.display = 'block'; 
        g.style.display = 'none'; 
        h.style.display = 'flex'; // Keep top-right controls visible
        if (resetBtn) resetBtn.style.display = 'none'; // Hide reset before game starts
        renderSetupUI(); 
    } else { 
        s.style.display = 'none'; 
        g.style.display = 'block'; 
        h.style.display = 'flex'; 
        if (resetBtn) resetBtn.style.display = 'block'; // Show reset during game
        renderTable(); 
        updateDiceUI(); 
    }
}

function calculateTotals() {
    players.forEach((p, idx) => {
        let u = 0; ['ones','twos','threes','fours','fives','sixes'].forEach(id => u += p.scores[id]||0);
        p.scores.upper_sum = u; p.scores.bonus = u >= 63 ? 35 : 0; p.scores.upper_total = u + p.scores.bonus;
        let l = 0; ['three_kind','four_kind','full_house','sm_straight','lg_straight','yacht','yacht_bonus','chance'].forEach(id => l += p.scores[id]||0);
        p.scores.lower_total = l; p.scores.grand_total = p.scores.upper_total + l;
        ['upper_sum','bonus','upper_total','lower_total','grand_total'].forEach(id => {
            const el = document.getElementById(`calc-${idx}-${id}`); if(el) el.innerText = p.scores[id];
        });
    });
}

function getPossibleScores(dice) {
    const c = {1:0,2:0,3:0,4:0,5:0,6:0}; let sum = 0; dice.forEach(d => { c[d]++; sum += d; });
    const s = { ones: c[1]*1, twos: c[2]*2, threes: c[3]*3, fours: c[4]*4, fives: c[5]*5, sixes: c[6]*6, chance: sum };
    const v = Object.values(c);
    s.three_kind = v.some(x => x >= 3) ? sum : 0; s.four_kind = v.some(x => x >= 4) ? sum : 0;
    s.full_house = (v.includes(3) && v.includes(2)) || v.includes(5) ? 25 : 0; s.yacht = v.includes(5) ? 50 : 0;
    const u = [...new Set(dice)].sort((a,b)=>a-b).join('');
    s.sm_straight = /1234|2345|3456/.test(u) ? 30 : 0; s.lg_straight = /12345|23456/.test(u) ? 40 : 0;
    return s;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('roll-btn').addEventListener('click', () => {
        if (rollsLeft > 0 && currentRound <= 13) {
            for (let i = 0; i < 5; i++) if (!heldDice[i]) diceValues[i] = Math.floor(Math.random() * 6) + 1;
            rollsLeft--; updateDiceUI(); renderTable(); 
        }
    });
    toggleViews();
    
    // --- INJECT THIS SCROLL SYNC BLOCK ---
    const tableContainer = document.querySelector('.table-container');
    const headerContainer = document.getElementById('header-scroll-container');
    if (tableContainer && headerContainer) {
        tableContainer.addEventListener('scroll', () => {
            headerContainer.scrollLeft = tableContainer.scrollLeft;
        });
    }
    // -------------------------------------

    // Close modal if user clicks outside the modal content
    window.onclick = function(event) {
        const modal = document.getElementById('rules-modal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

window.toggleRules = () => {
    const modal = document.getElementById('rules-modal');
    modal.style.display = (modal.style.display === "block") ? "none" : "block";
};

window.toggleOptimizer = () => { 
    optimizerEnabled = !optimizerEnabled; 
    const btn = document.getElementById('toggle-opt-btn');
    btn.innerText = optimizerEnabled ? 'Optimzer: ON' : 'Optimizer: OFF';
    btn.style.backgroundColor = optimizerEnabled ? '#beddff' : '#fff'; // Maps the button color to your chosen blue
    renderTable(); 
};
let resetTimer;
window.handleReset = () => {
    const btn = document.getElementById('reset-btn');
    
    // If already in warning state, execute the reset
    if (btn.innerText === 'SURE?') {
        location.reload();
    } else {
        // Change to warning state
        btn.innerText = 'SURE?';
        btn.style.background = '#FF0000'; // Brutalist Red
        btn.style.color = '#FFFFFF';
        
        // UX Bonus: Revert to normal after 3 seconds if not clicked again
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            btn.innerText = 'RESET';
            btn.style.background = '#fff'; // Back to default white
            btn.style.color = '#000';      // Back to default black text
        }, 3000);
    }
};
window.toggleDiceView = () => { diceView = (diceView === 'dice' ? 'numbers' : 'dice'); updateDiceUI(); };
window.toggleHold = (i) => { if (rollsLeft < 3) { heldDice[i] = !heldDice[i]; updateDiceUI(); } };
function resetDice() { heldDice = [false, false, false, false, false]; rollsLeft = 3; updateDiceUI(); renderTable(); }
window.removePlayer = (i) => { players.splice(i, 1); toggleViews(); };