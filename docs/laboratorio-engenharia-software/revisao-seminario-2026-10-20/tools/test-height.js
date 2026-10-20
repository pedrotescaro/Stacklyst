var TM = Java.type('com.change_vision.jude.api.inf.editor.TransactionManager');
TM.beginTransaction();
try {
  function walk(e) {
    try {
      Java.from(e.getDiagrams()).forEach(function (d) {
        if (String(d.getName()).indexOf('SQ01 Concluir') === 0) {
          Java.from(d.getPresentations())
            .filter(function (p) {
              return (
                p.getType() === 'Activation' &&
                Math.abs(p.getLocation().y - 85) < 1 &&
                p.getLocation().x > 300
              );
            })
            .forEach(function (p) {
              p.setHeight(440);
              print('HEIGHT ' + p.getHeight());
            });
        }
      });
    } catch (x) {
      print('INNER ' + x);
    }
    try {
      Java.from(e.getOwnedElements()).forEach(walk);
    } catch (x) {}
  }
  walk(astah.getProject());
  TM.endTransaction();
  astah.saveAs(
    'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-10-20/.build/height.asta'
  );
} catch (e) {
  TM.abortTransaction();
  print(e);
  java.lang.System.exit(1);
}
