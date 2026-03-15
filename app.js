// Each category now includes the exact array of legally possible scores
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
    // 3/4 of a kind and Chance are sums of 5 dice. Max is 30, min is 5 (plus 0 for scratching)
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

// ... categories array stays the same ...

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
        // Fail silently in private browsing so the app doesn't crash
    }
}

// ... rest of the functions (renderTable, calculateTotals, etc.) stay the same ...

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
                // Generate strict dropdown options based on the rules
                let optionsHtml = `<option value=""></option>`; // Empty default state
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
        players[playerIndex].scores[categoryId] = undefined;
    } else {
        players[playerIndex].scores[categoryId] = parseInt(value, 10);
    }
    saveState();
    calculateTotals();
};

window.removePlayer = function(index) {
    players.splice(index, 1);
    saveState();
    renderTable();
};

function calculateTotals() {
    players.forEach((p, index) => {
        // Upper Section Math
        let upperSum = 0;
        ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].forEach(id => {
            upperSum += p.scores[id] || 0;
        });

        const bonus = upperSum >= 63 ? 35 : 0;
        const upperTotal = upperSum