function ucDiagram(id, title, items, overview) {
  if (!items.length) return;
  var ed = factory.getUseCaseDiagramEditor(),
    dg = ed.createUseCaseDiagram(up, id + ' ' + title);
  record(dg, id, 'casos de uso UML');
  var h = items.length * 145 + 100;
  var rect = ed.createRect(new Point(300, 350), 650, h);
  prop(rect, 'fill.color', '#FFFFFF');
  text(ed, 'Stacklyst', 330, 365, 250);
  var ap = { U: node(ed, actors.U, 60, 390 + h / 2, 95, 100) };
  var used = ['E', 'R', 'AD'].filter(function (k) {
    return items.some(function (c) {
      return c.actor === k;
    });
  });
  if (used.length) {
    var parent = node(ed, actors.U, 650, 0, 95, 100);
    used.forEach(function (k, i) {
      var child = node(ed, actors[k], 430 + i * 250, 160, 95, 100);
      ed.createLinkPresentation(gens[k], child, parent);
      var positions = items
        .map(function (c, i) {
          return c.actor === k ? 420 + i * 145 : null;
        })
        .filter(function (n) {
          return n !== null;
        });
      ap[k] = node(
        ed,
        actors[k],
        1100,
        positions.reduce(function (a, b) {
          return a + b;
        }, 0) / positions.length,
        95,
        100
      );
    });
  }
  items.forEach(function (c, i) {
    var y = 420 + i * 145,
      p = node(ed, ucs[c.id], 410, y, 420, 95);
    p.setLabel(c.id + '\n' + wrap(c.name, 36));
    var l = assoc(ed, actors[c.actor], ucs[c.id], ap[c.actor], p, '');
    route(l, [[c.actor === 'U' ? 220 : 1010, y + 47]]);
  });
  text(
    ed,
    'Associações indicam participação. Pré-condições e variantes estão no catálogo de 24 casos.\nRepresentações repetidas de um ator referenciam o mesmo elemento da hierarquia.',
    320,
    h + 740,
    850
  );
}
