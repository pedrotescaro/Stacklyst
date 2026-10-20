var Files = Java.type('java.nio.file.Files'),
  Paths = Java.type('java.nio.file.Paths');
var data = { elements: [], diagrams: [] };
var seen = {};
function walk(e, path) {
  var name = String(e.getName()),
    id = String(e.getId());
  if (seen[id]) return;
  seen[id] = true;
  var item = { id: id, name: name, path: path, type: String(e.getClass().getSimpleName()) };
  try {
    item.operations = Java.from(e.getOperations()).map(function (o) {
      return String(o.getName());
    });
  } catch (x) {}
  data.elements.push(item);
  try {
    Java.from(e.getDiagrams()).forEach(function (d) {
      var di = {
        id: String(d.getId()),
        name: String(d.getName()),
        path: path + '/' + name,
        type: String(d.getClass().getSimpleName()),
        presentations: [],
      };
      Java.from(d.getPresentations()).forEach(function (p) {
        var z = { id: String(p.getID()), type: String(p.getType()), label: String(p.getLabel()) };
        try {
          z.model = String(p.getModel().getName());
          z.modelId = String(p.getModel().getId());
        } catch (x) {}
        try {
          z.x = p.getLocation().getX();
          z.y = p.getLocation().getY();
          z.w = p.getWidth();
          z.h = p.getHeight();
        } catch (x) {}
        try {
          z.properties = String(p.getProperties());
        } catch (x) {}
        try {
          z.attributes = Java.from(p.getModel().getAttributes()).map(function (a) {
            return String(a.getName()) + ': ' + String(a.getType().getName());
          });
          z.operations = Java.from(p.getModel().getOperations()).map(function (a) {
            return String(a.getName()) + '(): ' + String(a.getReturnType().getName());
          });
        } catch (x) {}
        try {
          z.source = String(p.getSource().getID());
          z.target = String(p.getTarget().getID());
          z.points = Java.from(p.getAllPoints()).map(function (q) {
            return [q.x, q.y];
          });
        } catch (x) {}
        di.presentations.push(z);
      });
      data.diagrams.push(di);
    });
  } catch (x) {
    print('Diagram inspection: ' + x);
  }
  try {
    Java.from(e.getOwnedElements()).forEach(function (c) {
      walk(c, path + '/' + name);
    });
  } catch (x) {}
}
walk(astah.getProject(), '');
Files.writeString(
  Paths.get(
    'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-10-06/.build/astah-before.json'
  ),
  JSON.stringify(data, null, 2)
);
print('Inspected ' + data.elements.length + ' elements, ' + data.diagrams.length + ' diagrams');
