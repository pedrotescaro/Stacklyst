var TM = Java.type('com.change_vision.jude.api.inf.editor.TransactionManager');
var MF = Java.type('com.change_vision.jude.api.inf.editor.ModelEditorFactory');
var P = Java.type('java.awt.geom.Point2D.Double');
TM.beginTransaction();
try {
  var root = astah.getProject();
  root.setName('Stacklyst seminário revisado');
  var pkg = MF.getBasicModelEditor().createPackage(root, 'Sequências');
  var ed = astah.getDiagramEditorFactory().getSequenceDiagramEditor();
  var d = ed.createSequenceDiagram(pkg, 'Teste');
  var a = ed.createLifeline('Usuário', 100),
    b = ed.createLifeline('Tela da lição', 400),
    c = ed.createLifeline('Avaliação', 700);
  print(a.getProperties());

  var m = ed.createMessage('1. Enviar resposta', a, b, 150);
  var m2 = ed.createMessage('2. Avaliar atividade', b, c, 230);
  var r = ed.createReturnMessage('3. Resultado', m2);
  TM.endTransaction();
  astah.saveAs(
    'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-10-20/.build/test.asta'
  );
  print('SUCCESS');
} catch (e) {
  TM.abortTransaction();
  print(e.stack || e);
  java.lang.System.exit(1);
}
