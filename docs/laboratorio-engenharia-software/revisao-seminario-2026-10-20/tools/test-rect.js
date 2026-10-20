var TM = Java.type('com.change_vision.jude.api.inf.editor.TransactionManager'),
  MF = Java.type('com.change_vision.jude.api.inf.editor.ModelEditorFactory'),
  P = Java.type('java.awt.geom.Point2D.Double');
TM.beginTransaction();
try {
  var ed = astah.getDiagramEditorFactory().getSequenceDiagramEditor(),
    pkg = MF.getBasicModelEditor().createPackage(astah.getProject(), 'TestGraphic');
  var d = ed.createSequenceDiagram(pkg, 'Graphic');
  try {
    print(ed.createRect(new P(100, 100), 100, 1));
  } catch (e) {
    print('RECTFAIL ' + e);
  }
  try {
    print(ed.createText('← - - - - - - - - - -', new P(100, 150)));
  } catch (e) {
    print('TEXTFAIL ' + e);
  }
  TM.endTransaction();
  astah.saveAs(
    'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-10-20/.build/graphic.asta'
  );
} catch (e) {
  TM.abortTransaction();
  print(e);
  java.lang.System.exit(1);
}
