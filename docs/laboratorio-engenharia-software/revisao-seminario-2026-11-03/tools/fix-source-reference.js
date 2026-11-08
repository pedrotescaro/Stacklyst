var TM = Java.type('com.change_vision.jude.api.inf.editor.TransactionManager');
function visit(e) {
  if (e.getName && String(e.getName()) === 'Lição' && e.setDefinition)
    e.setDefinition(
      'Classe conceitual do domínio. Correspondência técnica: src/lib/learning/catalog.ts'
    );
  if (e.getOwnedElements) Java.from(e.getOwnedElements()).forEach(visit);
}
TM.beginTransaction();
visit(astah.getProject());
TM.endTransaction();
astah.saveAs(
  'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-11-03/Stacklyst-modelos-atualizados.asta'
);
