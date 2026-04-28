let historyList = [];

function toggleTheme() {
    document.body.classList.toggle("light");
}

function generateMatrix() {
    let r = rows.value, c = cols.value;
    let html = "<table>";

    for (let i = 0; i < r; i++) {
        html += "<tr>";
        for (let j = 0; j < c; j++) {
            html += `<td><input class="matrix-cell" id="cell-${i}-${j}" value="0"></td>`;
        }
        html += "</tr>";
    }

    html += "</table>";
    matrixContainer.innerHTML = html;
}

function randomMatrix() {
    generateMatrix();
    let r = rows.value, c = cols.value;

    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            document.getElementById(`cell-${i}-${j}`).value =
                Math.floor(Math.random() * 10) - 5;
        }
    }
}

function getMatrix() {
    let r = rows.value, c = cols.value;
    let m = [];

    for (let i = 0; i < r; i++) {
        let row = [];
        for (let j = 0; j < c; j++) {
            row.push(parseFloat(document.getElementById(`cell-${i}-${j}`).value) || 0);
        }
        m.push(row);
    }
    return m;
}

/* ---------- RANK ---------- */
function calculateRank() {
    let m = JSON.parse(JSON.stringify(getMatrix()));
    let r = m.length, c = m[0].length;
    let rank = 0;
    let stepsHTML = "";

    for (let col = 0; col < c; col++) {
        let pivot = -1;

        for (let i = rank; i < r; i++) {
            if (m[i][col] !== 0) {
                pivot = i;
                break;
            }
        }

        if (pivot === -1) continue;

        [m[rank], m[pivot]] = [m[pivot], m[rank]];

        let pv = m[rank][col];
        for (let j = 0; j < c; j++) m[rank][j] /= pv;

        for (let i = 0; i < r; i++) {
            if (i !== rank) {
                let factor = m[i][col];
                for (let j = 0; j < c; j++) {
                    m[i][j] -= factor * m[rank][j];
                }
            }
        }

        stepsHTML += displayMatrix(m, rank, col);
        rank++;
    }

    result.innerText = "Rank = " + rank;
    steps.innerHTML = stepsHTML;

    saveHistory("Rank", rank);
}

/* ---------- DETERMINANT ---------- */
function calculateDet() {
    let m = getMatrix();

    if (m.length !== m[0].length) {
        result.innerText = "Determinant only for square matrix";
        return;
    }

    let det = determinant(m);
    result.innerText = "Determinant = " + det;

    saveHistory("Det", det);
}

function determinant(m) {
    if (m.length === 1) return m[0][0];

    if (m.length === 2)
        return m[0][0]*m[1][1] - m[0][1]*m[1][0];

    let det = 0;

    for (let i = 0; i < m.length; i++) {
        let sub = m.slice(1).map(row => row.filter((_, j) => j !== i));
        det += ((i%2===0?1:-1) * m[0][i] * determinant(sub));
    }

    return det;
}

/* ---------- INVERSE ---------- */
function calculateInverse() {
    let m = getMatrix();
    let n = m.length;

    if (n !== m[0].length) {
        result.innerText = "Inverse only for square matrix";
        return;
    }

    let I = identity(n);
    let M = m.map((row,i)=> row.concat(I[i]));

    for (let i = 0; i < n; i++) {
        let factor = M[i][i];

        if (factor === 0) {
            result.innerText = "No inverse";
            return;
        }

        for (let j = 0; j < 2*n; j++) M[i][j] /= factor;

        for (let k = 0; k < n; k++) {
            if (k !== i) {
                let f = M[k][i];
                for (let j = 0; j < 2*n; j++) {
                    M[k][j] -= f * M[i][j];
                }
            }
        }
    }

    let inv = M.map(row => row.slice(n));
    result.innerText = "Inverse calculated";
    steps.innerHTML = displayMatrix(inv);

    saveHistory("Inverse", "Done");
}

function identity(n) {
    let I = [];
    for (let i = 0; i < n; i++) {
        I[i] = [];
        for (let j = 0; j < n; j++) {
            I[i][j] = (i===j)?1:0;
        }
    }
    return I;
}

/* ---------- DISPLAY ---------- */
function displayMatrix(mat, pr=-1, pc=-1) {
    let html = "<table border='1'>";
    mat.forEach((row,i)=>{
        html += "<tr>";
        row.forEach((val,j)=>{
            let cls = (i===pr && j===pc) ? "pivot" : "";
            html += `<td class="${cls}">${val.toFixed(2)}</td>`;
        });
        html += "</tr>";
    });
    html += "</table>";
    return html;
}

/* ---------- HISTORY ---------- */
function saveHistory(type, value) {
    historyList.push(`${type}: ${value}`);
    history.innerHTML = historyList.reverse().join("<br>");
}

/* ---------- PDF ---------- */
async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    doc.text(result.innerText, 10, 10);

    let text = steps.innerText.split("\n");
    let y = 20;

    text.forEach(line => {
        doc.text(line, 10, y);
        y += 7;
    });

    doc.save("matrix.pdf");
}
function toggleMenu() {
    let menu = document.getElementById("menuContent");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

function clearHistory() {
    historyList = [];
    document.getElementById("history").innerHTML = "";
}
generateMatrix();
