var root = astah.getProject();
function walk(e) {
  try {
    Java.from(e.getDiagrams()).forEach(function (d) {
      if (String(d.getName()).indexOf('SQ01 Concluir') === 0) {
        Java.from(d.getPresentations()).forEach(function (p) {
          print(p.getType() + ' ' + p.getLabel() + ' ' + p.getProperties());
          try {
            print('LOC ' + p.getLocation() + ' WH ' + p.getWidth() + ' ' + p.getHeight());
          } catch (x) {}
          try {
            print('POINTS ' + Java.from(p.getAllPoints()));
          } catch (x) {}
        });
      }
    });
  } catch (x) {}
  try {
    Java.from(e.getOwnedElements()).forEach(walk);
  } catch (x) {}
}
walk(root);
