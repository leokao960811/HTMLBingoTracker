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
  var labels = document.querySelectorAll(".grid label");
  labels.forEach(function(label, i) {
    label.querySelector("input").checked = false;
    label.querySelector(".mark span").textContent = (i === 12) ? "FREE SPACE" : cells[i];
  });
}

function cellsFor(bank) {
  if (bank.generate) return bank.generate();
  return shuffle(bank.phrases.slice()).slice(0, 25);
}

function newCard() {
  var bank = BANKS[document.getElementById("bank").value];
  document.getElementById("title").textContent = bank.title;
  render(cellsFor(bank));
  document.getElementById("seed").textContent = Math.floor(Math.random() * 100000000);
}

document.addEventListener("DOMContentLoaded", function() {
  var select = document.getElementById("bank");
  Object.keys(BANKS).forEach(function(id) {
    var option = document.createElement("option");
    option.value = id;
    option.textContent = BANKS[id].title;
    select.appendChild(option);
  });
  select.addEventListener("change", newCard);
  newCard();
});