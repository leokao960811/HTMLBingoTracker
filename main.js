var banks = [];   // from banks/index.json
var cache = {};   // phrase lists already downloaded, by id

// Fisher-Yates Shuffle
var shuffle = function(array) {
  var m = array.length, t, i;
  // While there remain elements to shuffle
  while (m) {
    // Pick a remaining element
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
};
// Did I just steal this code from Wikipedia, or something?

// var insertToCard = function(array) {
//   var slot = 25;
//   while (slot) {
//     if(slot==13){
//       $("label:nth-child(" + slot + ") .mark span").text("FREE SPACE");
//     }
//     else{
//     $("label:nth-child(" + slot + ") .mark span").text(array[slot - 1]);
//     }
//     slot--;
//   }
// };


// $(document).ready(function() {
//   var shuffledLines = shuffle(lines);
//   insertToCard(shuffledLines); // #hellaswag
//   $("#seed").text(Math.floor(Math.random() * 100000000)); // TODO
// });

function generatePhrases(pool) {
  return shuffle(pool.slice()).slice(0, 25);
}

function generateClassic(){
  var cells = [];
  for(var col = 0; col < 5; col++){
    var pool = [];
    for(var n = col*15+1; n <= col * 15 + 15; n++) {pool.push(n);}
    shuffle(pool);
    for(var row = 0; row < 5; row++) {cells[row*5+col] = pool[row];}
  }
  return cells;
}

//Using DOM to avoid internet requirement
function render(cells) {
   document.querySelectorAll(".grid label").forEach(function(label, i) {
    label.querySelector("input").checked = false;
    label.querySelector(".mark span").textContent = (i === 12) ? "FREE SPACE" : cells[i];
  });
}

async function loadJSON(path) {
  var res = await fetch(path);
  if (!res.ok) throw new Error(path + " returned " + res.status);
  return res.json();
}

async function cellsFor(entry) {
  if (entry.type === "classic") return generateClassic();
  if (!cache[entry.id]) {
    var data = await loadJSON("banks/" + entry.file);
    if (!Array.isArray(data.phrases) || data.phrases.length < 24) {
      throw new Error(entry.file + " needs at least 24 phrases");
    }
    cache[entry.id] = data.phrases;
  }
  var picked = shuffle(cache[entry.id].slice()).slice(0, 24);
  picked.splice(12, 0, null);   // placeholder at the center; render() overwrites it
  return picked;
}

function showError(err) {
  console.error(err);
  document.getElementById("title").textContent = "Could not load bank";
}

async function newCard() {
  var select = document.getElementById("bank");
  var entry = banks[select.selectedIndex];
  var cells;
  try {
    cells = await cellsFor(entry);
  } catch (err) {
    return showError(err);
  }
  if (banks[select.selectedIndex] !== entry) return;   // selection changed while loading
  document.getElementById("title").textContent = entry.title;
  render(cells);
  document.getElementById("seed").textContent = Math.floor(Math.random() * 100000000);
}

document.addEventListener("DOMContentLoaded", async function() {
  var select = document.getElementById("bank");
  try {
    banks = await loadJSON("banks/index.json");
  } catch (err) {
    return showError(err);
  }
  banks.forEach(function(entry) {
    var option = document.createElement("option");
    option.value = entry.id;
    option.textContent = entry.title;
    select.appendChild(option);
  });
  select.addEventListener("change", newCard);
  newCard();
});