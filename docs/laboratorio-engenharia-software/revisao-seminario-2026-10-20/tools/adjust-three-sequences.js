var Files = Java.type('java.nio.file.Files'),
  Paths = Java.type('java.nio.file.Paths');
var R =
  'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-10-20';
var D = JSON.parse(String(Files.readString(Paths.get(R + '/tools/diagram-plan.json'))));
var TM = Java.type('com.change_vision.jude.api.inf.editor.TransactionManager'),
  P = Java.type('java.awt.geom.Point2D.Double');
var fac = astah.getDiagramEditorFactory(),
  targets = ['SQ02-B', 'SQ03-A', 'SQ03-C'],
  found = {},
  pkg;
function walk(e) {
  try {
    Java.from(e.getDiagrams()).forEach(function (d) {
      targets.forEach(function (id) {
        if (String(d.getName()).indexOf(id + ' ') === 0) {
          found[id] = d;
          pkg = e;
        }
      });
    });
  } catch (x) {}
  try {
    Java.from(e.getOwnedElements()).forEach(walk);
  } catch (x) {}
}
walk(astah.getProject());
function prop(p, k, v) {
  p.setProperty(k, String(v));
}
function style(p) {
  prop(p, 'fill.color', '#F4F8FA');
  prop(p, 'line.color', '#203746');
  prop(p, 'font.color', '#132B3A');
}
function txt(ed, t, x, y, w) {
  var p = ed.createText(t, new P(x, y));
  try {
    p.setWidth(w || 800);
  } catch (e) {}
  return p;
}
TM.beginTransaction();
try {
  targets.forEach(function (id) {
    if (!found[id]) throw Error('Missing ' + id);
    var ed = fac.getSequenceDiagramEditor();
    ed.delete(found[id]);
    var s = D.sequences.filter(function (z) {
      return z.id === id;
    })[0];
    var sd = ed.createSequenceDiagram(pkg, s.id + ' ' + s.title),
      ls = [],
      calls = {},
      step = 180,
      start = 60,
      gap = 61,
      offset = 25;
    s.participants.forEach(function (p, i) {
      p = String(p).replace(/\\n/g, '\n');
      var l = ed.createLifeline(p, start + i * step);
      style(l);
      prop(l, 'lifeline_length', Math.max(230, 65 + s.messages.length * gap) + offset);
      ls.push(l);
    });
    s.messages.forEach(function (m, i) {
      var p;
      if (m[3] === 'return' && calls[m[1] + '-' + m[0]]) {
        p = null;
        var yy = 85 + i * gap + offset,
          sx = start + m[0] * step + 55,
          tx = start + m[1] * step + 55,
          dir = tx > sx ? 1 : -1;
        for (var xx = sx; dir > 0 ? xx < tx - 12 : xx > tx + 12; xx += dir * 14) {
          var ee = dir > 0 ? Math.min(xx + 8, tx) : Math.max(xx - 8, tx);
          txt(ed, '−', Math.min(xx, ee), yy - 10, 13);
        }
        txt(ed, dir > 0 ? '>' : '<', tx - 5, yy - 10, 20);
        txt(ed, m[2], Math.min(sx, tx) + 15, yy - 24, Math.max(170, Math.abs(tx - sx) - 25));
      } else {
        p = ed.createMessage(m[2], ls[m[0]], ls[m[1]], 85 + i * gap + offset);
        calls[m[0] + '-' + m[1]] = p;
      }
      if (p) prop(p, 'line.color', '#203746');
    });
    sd.setDefinition(
      'Recorte ' +
        s.id +
        '. Fonte e correspondência: ' +
        JSON.stringify(s.source) +
        '\nMensagens deslocadas 25 unidades abaixo para preservar o cabeçalho ampliado.'
    );
    print('ADJUSTED ' + id);
  });
  TM.endTransaction();
  astah.saveAs(R + '/Stacklyst-seminario-revisado.asta');
  print('SAVED');
} catch (e) {
  TM.abortTransaction();
  print(e.stack || e);
  java.lang.System.exit(1);
}
