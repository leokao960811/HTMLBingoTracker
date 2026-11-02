var banks = [];   // from banks/index.json
var cache = {};   // phrase lists already downloaded, by id

// String -> 32-bit number (xmur3 hash)
function hashSeed(str) {
  var h = 1779033703 ^ str.length;
  for (var i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

// 32-bit number -> function returning floats in [0, 1) like Math.random (mulberry32)
function mulberry32(a) {
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(seed) {
  return mulberry32(hashSeed(seed));
}

function randomSeed() {
  return Math.floor(Math.random() * Math.pow(36, 6)).toString(36).padStart(6, "0");
}

// Fisher-Yates Shuffle
// var shuffle = function(array) {
//   var m = array.length, t, i;
//   // While there remain elements to shuffle
//   while (m) {
//     // Pick a remaining element
//     i = Math.floor(Math.random() * m--);
//     // And swap it with the current element.
//     t = array[m];
//     array[m] = array[i];
//     array[i] = t;
//   }
//   return array;
// };
// Did I just steal this code from Wikipedia, or something?

function shuffle(array, rand) {
  var m = array.length, t, i;
  while (m) {
    i = Math.floor(rand() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

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

function generateClassic(rand) {
  var cells = [];
  for (var col = 0; col < 5; col++) {
    var pool = [];
    for (var n = col * 15 + 1; n <= col * 15 + 15; n++) pool.push(n);
    shuffle(pool, rand);
    for (var row = 0; row < 5; row++) cells[row * 5 + col] = pool[row];
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

async function cellsFor(entry, rand) {
  if (entry.type === "classic") return generateClassic(rand);
  if (!cache[entry.id]) {
    var data = await loadJSON("banks/" + entry.file);
    if (!Array.isArray(data.phrases) || data.phrases.length < 24) {
      throw new Error(entry.file + " needs at least 24 phrases");
    }
    cache[entry.id] = data.phrases;
  }
  var picked = shuffle(cache[entry.id].slice(), rand).slice(0, 24);
  picked.splice(12, 0, null);
  return picked;
}

function showError(err) {
  console.error(err);
  document.getElementById("title").textContent = "Could not load bank";
}

var latest = 0;
async function loadCard(seed) {
  seed = String(seed).trim().toLowerCase();
  var select = document.getElementById("bank");
  var entry = banks[select.selectedIndex];
  var ticket = ++latest;
  var cells;
  try {
    cells = await cellsFor(entry, makeRng(seed));
  } catch (err) {
    return showError(err);
  }
  if (ticket !== latest) return;   // a newer request superseded this one
  document.getElementById("title").textContent = entry.title;
  render(cells);
  document.getElementById("seed").textContent = seed;
  updateURL(entry.id, seed);
}

function newCard() {
  loadCard(randomSeed());
}

function updateURL(bankId, seed) {
  var params = new URLSearchParams({ bank: bankId, seed: seed });
  history.replaceState(null, "", "?" + params);
}

document.addEventListener("DOMContentLoaded", async function() {
  var select = document.getElementById("bank");
  document.getElementById("new-card").addEventListener("click", newCard);
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
  var params = new URLSearchParams(location.search);
  var index = banks.findIndex(function(b) { return b.id === params.get("bank"); });
  select.selectedIndex = index >= 0 ? index : 0;
  loadCard(params.get("seed") || randomSeed());
});

