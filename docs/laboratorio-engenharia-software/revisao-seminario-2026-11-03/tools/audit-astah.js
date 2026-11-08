var Files = Java.type('java.nio.file.Files'),
  Paths = Java.type('java.nio.file.Paths');
var root =
  'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-11-03';
var IInclude = Java.type('com.change_vision.jude.api.inf.model.IInclude');
var IExtend = Java.type('com.change_vision.jude.api.inf.model.IExtend');
var IGeneralization = Java.type('com.change_vision.jude.api.inf.model.IGeneralization');
var seen = {},
  actors = [],
  includes = [],
  extendsList = [],
  generals = [],
  diagrams = [],
  generalCases = {},
  actorIds = {},
  structuralCounts = {};
function walk(e) {
  var id = String(e.getId());
  if (seen[id]) return;
  seen[id] = true;
  if (e instanceof IInclude)
    includes.push(
      String(e.getIncludingCase().getName()) + ' -> ' + String(e.getAddition().getName())
    );
  if (e instanceof IExtend)
    extendsList.push(
      String(e.getExtension().getName()) + ' -> ' + String(e.getExtendedCase().getName())
    );
  if (e instanceof IGeneralization)
    generals.push(String(e.getSubType().getName()) + ' -> ' + String(e.getSuperType().getName()));
  try {
    Java.from(e.getDiagrams()).forEach(function (d) {
      var dn = String(d.getName());
      diagrams.push(dn);
      var classIds = {};
      Java.from(d.getPresentations()).forEach(function (p) {
        var m = p.getModel();
        if (!m) return;
        var name = String(m.getName());
        if (
          dn.indexOf('UC-') === 0 &&
          ['Usuário', 'Avaliador', 'Recrutador', 'Administrador', 'Executor de código'].indexOf(
            name
          ) >= 0
        ) {
          if (actors.indexOf(name) < 0) actors.push(name);
          if (!actorIds[name]) actorIds[name] = [];
          if (actorIds[name].indexOf(String(m.getId())) < 0) actorIds[name].push(String(m.getId()));
        }
        if (dn.indexOf('UC-GERAL ') === 0 && /^UC\d{3}/.test(name))
          generalCases[name.match(/^UC\d{3}/)[0]] = true;
        if (/^(CL-|DER-)/.test(dn) && p.getType() === 'Class') classIds[String(m.getId())] = true;
        walk(m);
      });
      if (/^(CL-|DER-)/.test(dn)) structuralCounts[dn] = Object.keys(classIds).length;
    });
  } catch (x) {
    print('audit presentation ' + x);
  }
  try {
    Java.from(e.getOwnedElements()).forEach(walk);
  } catch (x) {}
}
walk(astah.getProject());
var plan = JSON.parse(String(Files.readString(Paths.get(root + '/tools/astah-plan.json'))));
var expected = plan.uc
    .map(function (c) {
      return c.id;
    })
    .sort(),
  actual = Object.keys(generalCases).sort();
var result = {
  actors: actors,
  actorModelIds: actorIds,
  includes: includes,
  extends: extendsList,
  generalizations: generals,
  diagrams: diagrams,
  structuralClassCounts: structuralCounts,
  catalogCount: expected.length,
  generalUseCases: actual,
  allCatalogCasesInGeneral: JSON.stringify(expected) === JSON.stringify(actual),
};
if (!result.allCatalogCasesInGeneral || expected.length !== 24)
  throw new Error('General diagram and catalog differ');
Files.writeString(
  Paths.get(root + '/validacao/astah-native-audit.json'),
  JSON.stringify(result, null, 2)
);
print(JSON.stringify(result));
