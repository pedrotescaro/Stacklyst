var Files = Java.type('java.nio.file.Files'),
  Paths = Java.type('java.nio.file.Paths');
var R =
  'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-10-06';
var E = JSON.parse(String(Files.readString(Paths.get(R + '/tools/code-evidence.json'))));
var TM = Java.type('com.change_vision.jude.api.inf.editor.TransactionManager'),
  MF = Java.type('com.change_vision.jude.api.inf.editor.ModelEditorFactory'),
  P = Java.type('java.awt.geom.Point2D.Double');
var bm = MF.getBasicModelEditor(),
  fac = astah.getDiagramEditorFactory(),
  all = [],
  diags = [];
function walk(e) {
  all.push(e);
  try {
    diags = diags.concat(Java.from(e.getDiagrams()));
  } catch (x) {}
  try {
    Java.from(e.getOwnedElements()).forEach(walk);
  } catch (x) {}
}
walk(astah.getProject());
function named(n) {
  return all.filter(function (e) {
    return String(e.getName()) === n;
  })[0];
}
function prop(p, k, v) {
  p.setProperty(k, String(v));
}
function node(ed, m, x, y, w, h) {
  var p = ed.createNodePresentation(m, new P(x, y));
  if (w) p.setWidth(w);
  if (h) p.setHeight(h);
  return p;
}
TM.beginTransaction();
try {
  var pack =
    named('06 Evidencias do seminario') ||
    bm.createPackage(astah.getProject(), '06 Evidencias do seminario');
  var ue = fac.getUseCaseDiagramEditor(),
    ce = fac.getClassDiagramEditor();
  E.forEach(function (e) {
    var id = 'EV-' + e.id;
    var old = diags.filter(function (d) {
      return String(d.getName()).indexOf(id + ' ') === 0;
    })[0];
    if (old) {
      if (e.id === 'AUTO01') ce.delete(old);
      else ue.delete(old);
    }
    if (e.id === 'AUTO01') {
      var d = ce.createClassDiagram(pack, id + ' Notificacao automatica da candidatura');
      var job = named('JobService'),
        notify = named('NotificationService');
      var p = node(ce, job, 50, 50, 360, 0),
        q = node(ce, notify, 50, 350, 360, 0);
      [p, q].forEach(function (n) {
        prop(n, 'attribute_compartment_visibility', 'false');
        prop(n, 'operation_compartment_visibility', 'true');
        prop(n, 'fill.color', '#E9F2F7');
      });
      var dep = bm.createDependency(notify, job, 'notifica candidato');
      ce.createLinkPresentation(dep, p, q);
      d.setDefinition(
        'Detalhamento de UC026. JobService.updateApplicationStage() chama NotificationService.create().'
      );
    } else {
      var d = ue.createUseCaseDiagram(pack, id + ' ' + e.title),
        actor = named(e.actor),
        uc = all.filter(function (m) {
          return String(m.getName()).indexOf(e.id + '\n') === 0;
        })[0];
      if (!actor || !uc) throw Error('Missing actor or use case ' + e.id);
      var ap = node(ue, actor, 230, 60),
        up = node(ue, uc, 90, 245, 325, 105),
        association = null;
      diags.some(function (d) {
        return Java.from(d.getPresentations()).some(function (p) {
          try {
            if (p.getType() !== 'Association') return false;
            var src = p.getSource().getModel(),
              dst = p.getTarget().getModel();
            if ((src.equals(actor) && dst.equals(uc)) || (dst.equals(actor) && src.equals(uc))) {
              association = p.getModel();
              return true;
            }
          } catch (x) {}
          return false;
        });
      });
      if (!association) association = bm.createAssociation(actor, uc, '', '', '');
      ue.createLinkPresentation(association, ap, up);
      d.setDefinition(
        'Vista focada de ' +
          e.id +
          ' para comparar com o codigo. Arquivo: ' +
          e.path +
          '. Os relacionamentos include/extend completos permanecem nas vistas por dominio.'
      );
    }
  });
  TM.endTransaction();
  astah.saveAs(R + '/.build/Stacklyst-seminario-evidencias.asta');
  print('10 native evidence views saved');
} catch (e) {
  TM.abortTransaction();
  print(e.stack || e);
  java.lang.System.exit(1);
}
