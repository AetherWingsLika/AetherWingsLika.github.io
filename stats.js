// ========================================
// Stats renderer
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


// ========================================
// Player order - Standard
// ========================================

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


// ========================================
// Display value
// ========================================

function displayValue(value) {
  return value === 0 ? "" : value;
}


// ========================================
// Render stats table
// ========================================

function displayStats(
  perfsFile,
  matchsFile,
  joueursFile,
  tbodyId,
  order = null
) {
  Promise.all([
    fetch(perfsFile).then(response => response.json()),
    fetch(matchsFile).then(response => response.json()),
    fetch(joueursFile).then(response => response.json())
  ]).then(([perfs, matchs, joueurs]) => {

    const matchIds = Object.keys(perfs);

    // Find the table containing this tbody
    const tbody = document.getElementById(tbodyId);
    const table = tbody.closest("table");
    const headerRow = table.querySelector("thead tr");


    // ========================================
    // Match headers
    // ========================================

    matchIds.forEach(matchId => {
      const match = matchs[matchId];
      const header = document.createElement("th");

      header.colSpan = 3;

      // Separator before every match
      header.classList.add("match-start");

      header.textContent =
        `${match.opp} · ${match.venue} · ${match.score}`;

      headerRow.appendChild(header);
    });


    // ========================================
    // Player order
    // ========================================

    let playersToDisplay;

    if (order) {
      // Standard team - predefined order
      playersToDisplay = order;
    } else {
      // U23 - numerical order
      playersToDisplay = Object.keys(joueurs).sort(
        (a, b) => Number(a) - Number(b)
      );
    }


    // ========================================
    // Grand totals
    // ========================================

    let totalP = 0;
    let totalT = 0;
    let totalR = 0;
    let totalMIN = 0;
    let totalG = 0;
    let totalA = 0;

    // Match-by-match totals
    const matchTotals = {};

    matchIds.forEach(matchId => {
      matchTotals[matchId] = {
        MIN: 0,
        G: 0,
        A: 0
      };
    });


    // ========================================
    // Players
    // ========================================

    playersToDisplay.forEach(playerId => {

      const player = joueurs[playerId];

      // Ignore IDs that don't exist in the JSON
      if (!player) return;

      const row = document.createElement("tr");


      // ========================================
      // ID
      // ========================================

      const idCell = document.createElement("td");

      idCell.textContent = playerId;

      row.appendChild(idCell);


      // ========================================
      // Name
      // ========================================

      const nameCell = document.createElement("td");

      nameCell.textContent = player.name;

      row.appendChild(nameCell);


      // ========================================
      // Totals
      // ========================================

      let P = 0;
      let T = 0;
      let R = 0;
      let MIN = 0;
      let GTOT = 0;
      let ATOT = 0;


      // ========================================
      // Calculate totals
      // ========================================

      matchIds.forEach(matchId => {

        const performance = perfs[matchId][playerId];

        if (performance) {

          MIN += performance[0];
          GTOT += performance[1];
          ATOT += performance[2];


          // Starter
          if (performance[3]) {

            T++;
            P++;

          // Substitute who played
          } else if (performance[0] > 0) {

            R++;
            P++;
          }
        }
      });


      // ========================================
      // Add to grand totals
      // ========================================

      totalP += P;
      totalT += T;
      totalR += R;
      totalMIN += MIN;
      totalA += ATOT;

      // Exclude goalkeeper goals from Total G
      if (player.position !== "GK") {
        totalG += GTOT;
      }


      // ========================================
      // P
      // ========================================

      const pCell = document.createElement("td");

      pCell.textContent = displayValue(P);
      pCell.style.backgroundColor = "#D4F4F1";

      row.appendChild(pCell);


      // ========================================
      // T
      // ========================================

      const tCell = document.createElement("td");

      tCell.textContent = displayValue(T);
      tCell.style.backgroundColor = "#E3F2D9";

      row.appendChild(tCell);


      // ========================================
      // R
      // ========================================

      const rCell = document.createElement("td");

      rCell.textContent = displayValue(R);
      rCell.style.backgroundColor = "#FFF2CA";

      row.appendChild(rCell);


      // ========================================
      // MIN
      // ========================================

      const minCell = document.createElement("td");

      minCell.textContent = displayValue(MIN);

      row.appendChild(minCell);


      // ========================================
      // Goals
      // ========================================

      const gtotCell = document.createElement("td");

      if (GTOT < 0) {

        gtotCell.textContent = Math.abs(GTOT);
        gtotCell.style.color = "red";

      } else {

        gtotCell.textContent = displayValue(GTOT);
      }

      row.appendChild(gtotCell);


      // ========================================
      // Assists
      // ========================================

      const atotCell = document.createElement("td");

      atotCell.textContent = displayValue(ATOT);

      row.appendChild(atotCell);


      // ========================================
      // Match-by-match data
      // ========================================

      matchIds.forEach(matchId => {

        const performance = perfs[matchId][playerId];


        // ====================================
        // MIN
        // ====================================

        const minMatchCell = document.createElement("td");

        // Separator before every match
        minMatchCell.classList.add("match-start");

        if (performance) {

          minMatchCell.textContent =
            displayValue(performance[0]);

          // Add to match total
          matchTotals[matchId].MIN += performance[0];


          // Starter
          if (performance[3]) {

            minMatchCell.style.backgroundColor = "#E3F2D9";

          // On bench / substitute
          } else {

            minMatchCell.style.backgroundColor = "#FFF2CA";
          }

        } else {

          // Player was not on the bench
          minMatchCell.textContent = displayValue(0);
        }

        row.appendChild(minMatchCell);


        // ====================================
        // Goals
        // ====================================

        const gCell = document.createElement("td");

        if (performance) {

          if (performance[1] < 0) {

            gCell.textContent = Math.abs(performance[1]);
            gCell.style.color = "red";

          } else {

            gCell.textContent =
              displayValue(performance[1]);
          }


          // Add to match total only if not GK
          if (player.position !== "GK") {
            matchTotals[matchId].G += performance[1];
          }


          // Starter
          if (performance[3]) {

            gCell.style.backgroundColor = "#E3F2D9";

          // Substitute
          } else {

            gCell.style.backgroundColor = "#FFF2CA";
          }

        } else {

          gCell.textContent = displayValue(0);
        }

        row.appendChild(gCell);


        // ====================================
        // Assists
        // ====================================

        const aCell = document.createElement("td");

        if (performance) {

          aCell.textContent =
            displayValue(performance[2]);

          // Add to match total
          matchTotals[matchId].A += performance[2];


          // Starter
          if (performance[3]) {

            aCell.style.backgroundColor = "#E3F2D9";

          // Substitute
          } else {

            aCell.style.backgroundColor = "#FFF2CA";
          }

        } else {

          aCell.textContent = displayValue(0);
        }

        row.appendChild(aCell);
      });


      // Add player row
      tbody.appendChild(row);
    });


    // ========================================
    // TOTAL ROW
    // ========================================

    const totalRow = document.createElement("tr");

    totalRow.classList.add("stats-total");


    // ========================================
    // Total label
    // ========================================

    const totalLabelCell = document.createElement("td");

    totalLabelCell.colSpan = 2;
    totalLabelCell.textContent = "Total";

    totalRow.appendChild(totalLabelCell);


    // ========================================
    // Total P
    // ========================================

    const totalPCell = document.createElement("td");

    totalPCell.textContent = displayValue(totalP);
    totalPCell.style.backgroundColor = "#D4F4F1";

    totalRow.appendChild(totalPCell);


    // ========================================
    // Total T
    // ========================================

    const totalTCell = document.createElement("td");

    totalTCell.textContent = displayValue(totalT);
    totalTCell.style.backgroundColor = "#E3F2D9";

    totalRow.appendChild(totalTCell);


    // ========================================
    // Total R
    // ========================================

    const totalRCell = document.createElement("td");

    totalRCell.textContent = displayValue(totalR);
    totalRCell.style.backgroundColor = "#FFF2CA";

    totalRow.appendChild(totalRCell);


    // ========================================
    // Total MIN
    // ========================================

    const totalMINCell = document.createElement("td");

    totalMINCell.textContent = displayValue(totalMIN);

    totalRow.appendChild(totalMINCell);


    // ========================================
    // Total Goals
    // ========================================

    const totalGCell = document.createElement("td");

    if (totalG < 0) {

      totalGCell.textContent = Math.abs(totalG);
      totalGCell.style.color = "red";

    } else {

      totalGCell.textContent = displayValue(totalG);
    }

    totalRow.appendChild(totalGCell);


    // ========================================
    // Total Assists
    // ========================================

    const totalACell = document.createElement("td");

    totalACell.textContent = displayValue(totalA);

    totalRow.appendChild(totalACell);


    // ========================================
    // Match-by-match totals
    // ========================================

    matchIds.forEach(matchId => {

      // ====================================
      // MIN
      // ====================================

      const totalMinMatchCell = document.createElement("td");

      totalMinMatchCell.classList.add("match-start");

      totalMinMatchCell.textContent =
        displayValue(matchTotals[matchId].MIN);

      totalRow.appendChild(totalMinMatchCell);


      // ====================================
      // Goals
      // ====================================

      const totalGMatchCell = document.createElement("td");

      const matchG = matchTotals[matchId].G;

      if (matchG < 0) {

        totalGMatchCell.textContent = Math.abs(matchG);
        totalGMatchCell.style.color = "red";

      } else {

        totalGMatchCell.textContent =
          displayValue(matchG);
      }

      totalRow.appendChild(totalGMatchCell);


      // ====================================
      // Assists
      // ====================================

      const totalAMatchCell = document.createElement("td");

      totalAMatchCell.textContent =
        displayValue(matchTotals[matchId].A);

      totalRow.appendChild(totalAMatchCell);
    });


    // Add total row at the bottom
    tbody.appendChild(totalRow);
  });
}


// ========================================
// STANDARD
// ========================================

displayStats(
  "./perfs.json",
  "./matchs.json",
  "./joueurs.json",
  "standard-stats",
  playerOrder
);


// ========================================
// U23 - SL16 FC
// ========================================

displayStats(
  "./peu23.json",
  "./mu23.json",
  "./ju23.json",
  "u23-stats"
);