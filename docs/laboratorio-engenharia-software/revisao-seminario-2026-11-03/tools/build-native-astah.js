// Runs in Astah's official Java API through the installed JavaScript engine.
var Files = Java.type('java.nio.file.Files'),
  Paths = Java.type('java.nio.file.Paths');
var R =
  'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-11-03';
var D = JSON.parse(String(Files.readString(Paths.get(R + '/tools/astah-plan.json'))));
var TM = Java.type('com.change_vision.jude.api.inf.editor.TransactionManager');
var MF = Java.type('com.change_vision.jude.api.inf.editor.ModelEditorFactory');
var Point = Java.type('java.awt.geom.Point2D.Double');
var bm = MF.getBasicModelEditor(),
  um = MF.getUseCaseModelEditor(),
  factory = astah.getDiagramEditorFactory();
var made = [],
  warnings = [];
function prop(p, k, v) {
  try {
    p.setProperty(k, String(v));
  } catch (e) {
    warnings.push(k + ': ' + String(e));
  }
}
function node(ed, m, x, y, w, h) {
  var p = ed.createNodePresentation(m, new Point(x, y));
  if (w) p.setWidth(w);
  if (h) p.setHeight(h);
  prop(p, 'fill.color', '#FFFFFF');
  prop(p, 'line.color', '#334155');
  return p;
}
function text(ed, t, x, y, w) {
  var p = ed.createText(t, new Point(x, y));
  try {
    p.setWidth(w || 1000);
  } catch (e) {}
  return p;
}
function wrap(s, n) {
  var a = s.split(' '),
    lines = [],
    line = '';
  a.forEach(function (w) {
    if ((line + ' ' + w).length > n) {
      lines.push(line);
      line = w;
    } else line += (line ? ' ' : '') + w;
  });
  if (line) lines.push(line);
  return lines.join('\n');
}
function record(d, id, type) {
  made.push({ id: id, name: String(d.getName()), type: type });
}
function assoc(ed, a, b, pa, pb, label, mulA, mulB) {
  var m = bm.createAssociation(a, b, label || '', '', '');
  if (mulA) m.getMemberEnds()[0].setMultiplicityString(mulA);
  if (mulB) m.getMemberEnds()[1].setMultiplicityString(mulB);
  var l = ed.createLinkPresentation(m, pa, pb);
  prop(l, 'line.shape', 'curve');
  return l;
}
function route(p, bends) {
  var ends = Java.from(p.getAllPoints()),
    points = [ends[0]];
  bends.forEach(function (b) {
    points.push(new Point(b[0], b[1]));
  });
  points.push(ends[ends.length - 1]);
  p.setAllPoints(Java.to(points, 'java.awt.geom.Point2D[]'));
}
TM.beginTransaction();
try {
  print('PHASE root');
  var root = astah.getProject();
  root.setName('Stacklyst revisão 03 novembro 2026');
  var up = bm.createPackage(root, '01 Casos de uso'),
    cp = bm.createPackage(root, '02 Classes do domínio'),
    dbp = bm.createPackage(root, '03 Dados e chaves'),
    sp = bm.createPackage(root, '04 Sequências e recortes');
  print('PHASE actors');
  var actors = {
    U: um.createActor(up, 'Usuário'),
    E: um.createActor(up, 'Avaliador'),
    R: um.createActor(up, 'Recrutador'),
    AD: um.createActor(up, 'Administrador'),
  };
  var gens = {};
  ['E', 'R', 'AD'].forEach(function (k) {
    gens[k] = bm.createGeneralization(actors[k], actors.U, '');
  });
  print('PHASE cases');
  var ucs = {};
  D.uc.forEach(function (c) {
    ucs[c.id] = um.createUseCase(up, c.id + ' ' + c.name);
    ucs[c.id].setDefinition(c.definition);
  });
  load(R + '/tools/general-usecase.js');
  load(R + '/tools/specific-usecases.js');
  generalOverview();
  var groups = {
    APRENDIZAGEM: ['Trilhas', 'Reconhecimento', 'Quizzes'],
    COMUNIDADE: ['Comunidade', 'Perfil', 'Recursos pessoais', 'Mídia'],
    DUELOS: ['Duelos', 'Avaliadores'],
    OPORTUNIDADES: ['Recrutamento', 'Eventos'],
    CONTA: ['Conta e acesso', 'Administração', 'Mobile', 'Conteúdo editorial'],
  };
  for (var g in groups)
    ucDiagram(
      'UC-' + g,
      'Casos de uso ' + g.toLowerCase(),
      D.uc.filter(function (c) {
        return groups[g].indexOf(c.area) >= 0;
      }),
      false
    );
  ucDiagram(
    'UC-TRILHAS-DEMO',
    'Lição, avaliação e ajuda',
    D.uc.filter(function (c) {
      return ['UC005', 'UC006', 'UC012', 'UC028', 'UC052'].indexOf(c.id) >= 0;
    }),
    false
  );
  ucDiagram(
    'UC-VAGA-DEMO',
    'Publicar empresa e vaga',
    D.uc.filter(function (c) {
      return ['UC017', 'UC025'].indexOf(c.id) >= 0;
    }),
    false
  );
  ucDiagram(
    'UC-CANDIDATURA-DEMO',
    'Candidatura e movimentação',
    D.uc.filter(function (c) {
      return ['UC022', 'UC026', 'UC056'].indexOf(c.id) >= 0;
    }),
    false
  );
  print('PHASE concise structures');
  load(R + '/tools/structural-views.js');
  D.sequences.forEach(function (s) {
    print('SEQUENCE ' + s.id);
    var ed = factory.getSequenceDiagramEditor(),
      d = ed.createSequenceDiagram(sp, s.id + ' ' + s.title);
    record(d, s.id, 'sequência UML');
    var ls = [],
      calls = {},
      gap = 85,
      ps = [],
      responses = [];
    s.participants.forEach(function (n, i) {
      var l = ed.createLifeline(n, 80 + i * 280);
      try {
        l.setWidth(210);
        l.setHeight(60);
      } catch (e) {}
      prop(l, 'fill.color', '#FFFFFF');
      prop(l, 'lifeline_length', 120 + s.messages.length * gap);
      ls.push(l);
    });
    s.messages.forEach(function (m, i) {
      var p;
      var y = 120 + i * gap;
      // UML permits omitting reply arrows: store results on the actual call and
      // show chronological result notes without placing false synchronous calls.
      if (m[3]) {
        var call = calls[m[1] + '-' + m[0]];
        if (call) {
          call.p.getModel().setReturnValue('resultado');
        }
        responses.push(
          (m[4] ? '[' + m[4] + '] ' : '') +
            s.participants[m[0]] +
            ' → ' +
            s.participants[m[1]] +
            ': ' +
            m[2]
        );
        var note = ed.createNote(
          (m[4] ? '[' + wrap(m[4], 38) + ']\n' : '') + 'Resposta: ' + wrap(m[2], 38),
          new Point(ls[m[1]].getLocation().x, y)
        );
        prop(note, 'fill.color', '#FFFFFF');
        try {
          note.setWidth(245);
        } catch (e) {}
        ps[i] = note;
      } else {
        p = ed.createMessage(m[2], ls[m[0]], ls[m[1]], y);
        if (m[4]) p.getModel().setGuard(m[4]);
        calls[m[0] + '-' + m[1]] = { p: p, y: y };
        ps[i] = p;
      }
    });
    // Alternative messages retain explicit guards. Detailed branch structure is
    // also preserved in the textual specification and the plan's fragment tree.
    d.setDefinition(
      'Fonte: docs/manual/detalhado/sequencias.md. Fluxo e condições: ' + s.conditions.join('; ')
    );
    text(
      ed,
      'Respostas: valores de retorno nas chamadas e notas na linha de vida receptora.\nCondições e alternativas: ' +
        wrap(s.conditions.join(' | '), 160) +
        '\nFonte de notação: Guedes, 2018, cap. 7.',
      30,
      180 + s.messages.length * gap,
      Math.max(1000, s.participants.length * 280)
    );
  });
  TM.endTransaction();
  astah.saveAs(R + '/Stacklyst-modelos-atualizados.asta');
  Files.writeString(
    Paths.get(R + '/diagramas/inventario-astah.json'),
    JSON.stringify(made, null, 2)
  );
  Files.writeString(
    Paths.get(R + '/validacao/astah-warnings.json'),
    JSON.stringify(warnings, null, 2)
  );
  print('SUCCESS ' + made.length + ' diagramas UML nativos');
} catch (e) {
  TM.abortTransaction();
  print(e.stack || e);
  if (e.printStackTrace) e.printStackTrace();
  java.lang.System.exit(1);
}
