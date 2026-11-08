var Files = Java.type('java.nio.file.Files'),
  Paths = Java.type('java.nio.file.Paths');
var R =
  'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-final-2026-11-03';
var UC = Java.type('com.change_vision.jude.api.inf.model.IUseCase'),
  data = { useCases: [], diagrams: [] },
  seen = {};
function visit(e) {
  var id = String(e.getId());
  if (seen[id]) return;
  seen[id] = true;
  if (UC.class.isInstance(e))
    data.useCases.push({
      id: id,
      name: String(e.getName()),
      definition: String(e.getDefinition()),
    });
  if (e.getDiagrams)
    Java.from(e.getDiagrams()).forEach(function (d) {
      var dg = {
        id: String(d.getId()),
        name: String(d.getName()),
        type: String(d.getClass().getSimpleName()),
        presentations: [],
      };
      Java.from(d.getPresentations()).forEach(function (p) {
        var v = { type: String(p.getType()), label: String(p.getLabel()) };
        try {
          v.modelId = String(p.getModel().getId());
          v.modelName = String(p.getModel().getName());
        } catch (x) {}
        try {
          v.source = String(p.getSource().getModel().getName());
          v.target = String(p.getTarget().getModel().getName());
        } catch (x) {}
        dg.presentations.push(v);
      });
      data.diagrams.push(dg);
    });
  if (e.getOwnedElements) Java.from(e.getOwnedElements()).forEach(visit);
}
visit(astah.getProject());
Files.writeString(
  Paths.get(R + '/fontes/inventario-astah-usuario.json'),
  JSON.stringify(data, null, 2)
);
print('Casos ' + data.useCases.length + ' diagramas ' + data.diagrams.length);
data.useCases.forEach(function (c) {
  print(c.name);
});
data.diagrams.forEach(function (d) {
  print('DIAGRAMA ' + d.name + ' (' + d.presentations.length + ')');
});
