window.BANKS = window.BANKS || {};

BANKS.classic = {
  title: "Classic",
  generate: function() {
    var cells = [];
    for (var col = 0; col < 5; col++) {
      var pool = [];
      for (var n = col * 15 + 1; n <= col * 15 + 15; n++) pool.push(n);
      shuffle(pool);
      for (var row = 0; row < 5; row++) cells[row * 5 + col] = pool[row];
    }
    return cells;
  }
};