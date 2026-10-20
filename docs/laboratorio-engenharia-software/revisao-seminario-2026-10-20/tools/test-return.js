var TM = Java.type('com.change_vision.jude.api.inf.editor.TransactionManager'),
  P = Java.type('java.awt.geom.Point2D.Double');
TM.beginTransaction();
function walk(e) {
  try {
    Java.from(e.getDiagrams()).forEach(function (d) {
      if (String(d.getName()).indexOf('SQ01 Concluir') === 0) {
        Java.from(d.getPresentations())
          .filter(function (p) {
            return p.getType() === 'Message' && p.getModel().isReturnMessage();
          })
          .forEach(function (p) {
            try {
              var pts = Java.from(p.getAllPoints());
              pts.forEach(function (q) {
                q.setLocation(q.x, q.y + 300);
              });
              p.setAllPoints(Java.to(pts, 'java.awt.geom.Point2D[]'));
              print('MOVED ' + p.getLabel());
            } catch (x) {
              print('FAIL ' + x);
            }
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
try {
  walk(astah.getProject());
  TM.endTransaction();
  astah.saveAs(
    'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-10-20/.build/return.asta'
  );
} catch (e) {
  TM.abortTransaction();
  print(e);
  java.lang.System.exit(1);
}
