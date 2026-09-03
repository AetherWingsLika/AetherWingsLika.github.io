// ========================================
// perfs.json structure
// ========================================
//
// perfs[match][player] → [minutes, goals, assists, starter]
//
// perfs[...][...][0] → minutes
// perfs[...][...][1] → goals
// perfs[...][...][2] → assists
// perfs[...][...][3] → starter
//
// ========================================

// Player order from joueurs.json
const playerOrder = [
  "1",
  "21",
  "35",
  "3",
  "4",
  "20",
  "24",
  "25",
  "29",
  "34",
  "13",
  "18",
  "6",
  "23",
  "80",
  "22",
  "27",
  "84",
  "94",
  "7",
  "11",
  "15",
  "19",
  "10",
  "17",
  "77",
  "9",
  "59"
];

Promise.all([
  fetch("./perfs.json").then(response => response.json()),
  fetch("./matchs.json").then(response => response.json()),
  fetch("./joueurs.json").then(response => response.json())
]).then(([perfs, matchs, joueurs]) => {

  const matchIds = Object.keys(perfs);

  const headerRow = document.querySelector(".player-stats thead tr");

  matchIds.forEach(matchId => {

    const match = matchs[matchId];

    const header = document.createElement("th");

    header.colSpan = 3;

    // Separator before every match
    header.classList.add("match-start");

    header.textContent = `${match.opp} · ${match.venue} · ${match.score}`;

    headerRow.appendChild(header);

  });

  const tbody = document.getElementById("standard-stats");

  playerOrder.forEach(playerId => {

    const player = joueurs[playerId];

    const row = document.createElement("tr");

    // ID
    const idCell = document.createElement("td");
    idCell.textContent = playerId;
    row.appendChild(idCell);

    // Name
    const nameCell = document.createElement("td");
    nameCell.textContent = player.name;
    row.appendChild(nameCell);

    let P = 0;
    let T = 0;
    let R = 0;
    let MIN = 0;
    let GTOT = 0;
    let ATOT = 0;

    // Calculate totals
    matchIds.forEach(matchId => {

      const performance = perfs[matchId][playerId];

      if (performance) {

        MIN += performance[0];
        GTOT += performance[1];
        ATOT += performance[2];

        if (performance[3]) {
          T++;
          P++;
        } else if (performance[0] > 0) {
          R++;
          P++;
        }

      }

    });

    // P
    const pCell = document.createElement("td");
    pCell.textContent = P;
    pCell.style.backgroundColor = "#D4F4F1";
    row.appendChild(pCell);

    // T
    const tCell = document.createElement("td");
    tCell.textContent = T;
    tCell.style.backgroundColor = "#E3F2D9";
    row.appendChild(tCell);

    // R
    const rCell = document.createElement("td");
    rCell.textContent = R;
    rCell.style.backgroundColor = "#FFF2CA";
    row.appendChild(rCell);

    // MIN
    const minCell = document.createElement("td");
    minCell.textContent = MIN;
    row.appendChild(minCell);

    // GTOT
    const gtotCell = document.createElement("td");

    if (GTOT < 0) {
      gtotCell.textContent = Math.abs(GTOT);
      gtotCell.style.color = "red";
    } else {
      gtotCell.textContent = GTOT;
    }

    row.appendChild(gtotCell);

    // ATOT
    const atotCell = document.createElement("td");
    atotCell.textContent = ATOT;
    row.appendChild(atotCell);

    // Match-by-match data
    matchIds.forEach(matchId => {

      const performance = perfs[matchId][playerId];

      // MIN
      const minMatchCell = document.createElement("td");

      // Separator before every match
      minMatchCell.classList.add("match-start");

      if (performance) {

        minMatchCell.textContent = performance[0];

        // Starter
        if (performance[3]) {
          minMatchCell.style.backgroundColor = "#E3F2D9";
        }

        // On bench / substitute
        else {
          minMatchCell.style.backgroundColor = "#FFF2CA";
        }

      } else {

        // Player was not on the bench
        minMatchCell.textContent = 0;

      }

      row.appendChild(minMatchCell);

      // Goals
      const gCell = document.createElement("td");

      if (performance) {

        if (performance[1] < 0) {
          gCell.textContent = Math.abs(performance[1]);
          gCell.style.color = "red";
        } else {
          gCell.textContent = performance[1];
        }

        if (performance[3]) {
          gCell.style.backgroundColor = "#E3F2D9";
        } else {
          gCell.style.backgroundColor = "#FFF2CA";
        }

      } else {

        gCell.textContent = 0;

      }

      row.appendChild(gCell);

      // Assists
      const aCell = document.createElement("td");

      if (performance) {

        aCell.textContent = performance[2];

        if (performance[3]) {
          aCell.style.backgroundColor = "#E3F2D9";
        } else {
          aCell.style.backgroundColor = "#FFF2CA";
        }

      } else {

        aCell.textContent = 0;

      }

      row.appendChild(aCell);

    });

    tbody.appendChild(row);

  });

});
