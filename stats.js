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
  "59"
];

Promise.all([
  fetch("./perfs.json").then(response => response.json()),
  fetch("./matchs.json").then(response => response.json()),
  fetch("./joueurs.json").then(response => response.json())
]).then(([perfs, matchs, joueurs]) => {

  const headerRow = document.querySelector(".player-stats thead tr");

  Object.keys(perfs).forEach(matchId => {

    const match = matchs[matchId];

    const header = document.createElement("th");

    header.colSpan = 3;

    header.textContent = `${match.opp} · ${match.venue} · ${match.score}`;

    headerRow.appendChild(header);

  });

  const tbody = document.getElementById("standard-stats");

  playerOrder.forEach(playerId => {

    const player = joueurs[playerId];

    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = playerId;
    row.appendChild(idCell);

    const nameCell = document.createElement("td");
    nameCell.textContent = player.name;
    row.appendChild(nameCell);

    let P = 0;
    let T = 0;
    let R = 0;
    let MIN = 0;
    let GTOT = 0;
    let ATOT = 0;

    Object.keys(perfs).forEach(matchId => {

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

    const pCell = document.createElement("td");
    pCell.textContent = P;
    row.appendChild(pCell);

    const tCell = document.createElement("td");
    tCell.textContent = T;
    row.appendChild(tCell);

    const rCell = document.createElement("td");
    rCell.textContent = R;
    row.appendChild(rCell);

    const minCell = document.createElement("td");
    minCell.textContent = MIN;
    row.appendChild(minCell);

    const gtotCell = document.createElement("td");
    gtotCell.textContent = GTOT;
    row.appendChild(gtotCell);

    const atotCell = document.createElement("td");
    atotCell.textContent = ATOT;
    row.appendChild(atotCell);

    Object.keys(perfs).forEach(matchId => {

      const performance = perfs[matchId][playerId];

      const minCell = document.createElement("td");
      minCell.textContent = performance ? performance[0] : 0;
      row.appendChild(minCell);

      const gCell = document.createElement("td");
      gCell.textContent = performance ? performance[1] : 0;
      row.appendChild(gCell);

      const aCell = document.createElement("td");
      aCell.textContent = performance ? performance[2] : 0;
      row.appendChild(aCell);

    });

    tbody.appendChild(row);

  });

});
