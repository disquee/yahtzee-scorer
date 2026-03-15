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
    { id: 'yahtzee', label: 'YAHTZEE (50)', section: 'lower', options: [0, 50] },
    { id: 'yahtzee_bonus', label: 'Yahtzee Bonus', section: 'lower', options: [0, 100, 200, 300] },
    { id: 'chance', label: 'Chance', section: 'lower', options: [0, 5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30] },
    { id: 'lower_total', label: 'Lower Total', section: 'lower_calc', isCalc: true },
    { id: 'grand_total', label: 'GRAND TOTAL', section: 'grand_calc', isCalc: true }
];

let players = [];
try {
    players = JSON.parse(localStorage.getItem('yahtzeePlayers')) || [];
} catch (e) {
    console.warn("Private browsing detected: LocalStorage is disabled. State won't save on refresh.");
}

function saveState() {
    try {
        localStorage.setItem('yahtzeePlayers', JSON.stringify(players));
    } catch (e) {
        // Fail silently in private browsing
    }
}

function renderTable() {
    const table = document.getElementById('score-table');
    let html = '<thead><tr><th>Category</th>';
    players.forEach((p, index) => {
        html += `<th>${p.name} <span style="cursor:pointer; font-size: 0.8em;" onclick="removePlayer(${index})">❌</span></th>`;
    });
    html += '</tr></thead><tbody>';

    categories.forEach(cat => {
        const rowClass = cat.isCalc ? 'total-row' : 'category-row';
        html += `<tr class="${rowClass}"><td>${cat.label}</td>`;
        
        players.forEach((p, pIndex) => {
            if (cat.isCalc) {
                html += `<td id="calc-${pIndex}-${cat.id}">${p.scores[cat.id] || 0}</td>`;
            } else {
                let optionsHtml = `<option value=""></option>`; 
                cat.options.forEach(opt => {
                    const selected = p.scores[cat.id] === opt ? 'selected' : '';
                    optionsHtml += `<option value="${opt}" ${selected}>${opt}</option>`;
                });
                
                html += `<td>
                            <select onchange="updateScore(${pIndex}, '${cat.id}', this.value)">
                                ${optionsHtml}
                            </select>
                         </td>`;
            }
        });
        html += '</tr>';
    });

    html += '</tbody>';
    table.innerHTML = html;
    calculateTotals();
}

window.updateScore = function(playerIndex, categoryId, value) {
    if (value === "") {
        delete players[playerIndex].scores[categoryId];
    } else {
        players[playerIndex].scores[categoryId] = parseInt(value, 10);
    }
    saveState();
    calculateTotals();
};

window.removePlayer = function(index) {
    players.splice(index, 1);
    // Guarantee at least one blank player remains so the table doesn't break
    if (players.length === 0) {
        players.push({ name: 'Player 1', scores: {} });
    }
    saveState();
    renderTable();
};

function calculateTotals() {
    players.forEach((p, index) => {
        let upperSum = 0;
        ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].forEach(id => {
            upperSum += p.scores[id] || 0;
        });

        const bonus = upperSum >= 63 ? 35 : 0;
        const upperTotal = upperSum + bonus;

        let lowerSum = 0;
        ['three_kind', 'four_kind', 'full_house', 'sm_straight', 'lg_straight', 'yahtzee', 'yahtzee_bonus', 'chance'].forEach(id => {
            lowerSum += p.scores[id] || 0;
        });

        const grandTotal = upperTotal + lowerSum;

        p.scores.upper_sum = upperSum;
        p.scores.bonus = bonus;
        p.scores.upper_total = upperTotal;
        p.scores.lower_total = lowerSum;
        p.scores.grand_total = grandTotal;

        if (document.getElementById(`calc-${index}-upper_sum`)) {
            document.getElementById(`calc-${index}-upper_sum`).innerText = upperSum;
            document.getElementById(`calc-${index}-bonus`).innerText = bonus;
            document.getElementById(`calc-${index}-upper_total`).innerText = upperTotal;
            document.getElementById(`calc-${index}-lower_total`).innerText = lowerSum;
            document.getElementById(`calc-${index}-grand_total`).innerText = grandTotal;
        }
    });
    saveState();
}

// Add Player Logic
document.getElementById('add-player-btn').addEventListener('click', () => {
    const inputField = document.getElementById('new-player-name');
    const name = inputField.value.trim();
    
    if (name) {
        players.push({ name, scores: {} });
        saveState();
        renderTable();
        inputField.value = ''; 
    }
});

// Reset Game Logic (Double Tap)
let resetTapCount = 0;
document.getElementById('reset-btn').addEventListener('click', (e) => {
    if (resetTapCount === 0) {
        e.target.innerText = "Sure?";
        e.target.style.background = "#ffcccc";
        resetTapCount++;
        
        setTimeout(() => {
            e.target.innerText = "Reset";
            e.target.style.background = "white";
            resetTapCount = 0;
        }, 3000);
    } else {
        players.forEach(p => p.scores = {});
        saveState();
        renderTable();
        
        e.target.innerText = "Reset";
        e.target.style.background = "white";
        resetTapCount = 0;
    }
});

// Initial Render
if (players.length === 0) {
    players.push({ name: 'Player 1', scores: {} });
}
renderTable();