// Executado dentro do Script Editor do Astah UML 12 pela API oficial.
var rootPath =
  'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-astah-2026-09-28';
var Files = Java.type('java.nio.file.Files'),
  Paths = Java.type('java.nio.file.Paths');
var D = JSON.parse(String(Files.readString(Paths.get(rootPath + '/tools/model-data.json'))));
var TM = Java.type('com.change_vision.jude.api.inf.editor.TransactionManager');
var MF = Java.type('com.change_vision.jude.api.inf.editor.ModelEditorFactory');
var P = Java.type('java.awt.geom.Point2D.Double');
var bm = MF.getBasicModelEditor(),
  um = MF.getUseCaseModelEditor();
var factory = astah.getDiagramEditorFactory();
var diagrams = [],
  log = [];
function point(x, y) {
  return new P(x, y);
}
function safeProp(n, k, v) {
  try {
    n.setProperty(k, String(v));
  } catch (e) {
    log.push(k + ': ' + e);
  }
}
function style(n, fill) {
  safeProp(n, 'fill.color', fill || '#FFFFFF');
  safeProp(n, 'font.size', '14');
  safeProp(n, 'line.color', '#263342');
  return n;
}
function txt(ed, s, x, y, w) {
  var n = ed.createText(s, point(x, y));
  if (w) n.setWidth(w);
  style(n);
  return n;
}
function note(ed, s, x, y, w) {
  var n = ed.createNote(s, point(x, y));
  n.setWidth(w || 600);
  style(n, '#FFFBEA');
  return n;
}
function node(ed, m, x, y, w, h) {
  var n = ed.createNodePresentation(m, point(x, y));
  style(n);
  if (w) n.setWidth(w);
  if (h) n.setHeight(h);
  return n;
}
function addD(d) {
  diagrams.push(d);
  return d;
}
function ucId(n) {
  return 'UC' + ('00' + n).slice(-3);
}
function wrap(s, n) {
  var a = s.split(' '),
    o = [],
    l = '';
  for (var i = 0; i < a.length; i++) {
    if ((l + ' ' + a[i]).length > n) {
      o.push(l);
      l = a[i];
    } else l += (l ? ' ' : '') + a[i];
  }
  if (l) o.push(l);
  return o.join('\n');
}
try {
  TM.beginTransaction();
  log.push('begin');
  // Only replace the earlier proof package made by this script in this new project.
  var root = astah.getProject();
  root.setName('Stacklyst');
  var owned = root.getOwnedElements();
  for (var i = 0; i < owned.length; i++)
    if (String(owned[i].getName()) === 'Stacklyst - revisao 28-09-2026') bm.delete(owned[i]);
  log.push('root ready');
  var ucp = bm.createPackage(root, '01 Casos de uso');
  var act = {},
    ucs = {},
    assoc = {},
    general = {};
  for (var k in D.actors) act[k] = um.createActor(ucp, D.actors[k]);
  for (var i = 0; i < D.uc.length; i++) {
    var u = D.uc[i];
    ucs[u.id] = um.createUseCase(ucp, u.id + ' ' + u.name);
    ucs[u.id].setDefinition('Especificação: documento 04, seção 5.' + parseInt(u.id.slice(2), 10));
  }
  for (var k in D.participation)
    for (var j = 0; j < D.participation[k].length; j++) {
      var id = ucId(D.participation[k][j]);
      assoc[k + id] = bm.createAssociation(act[k], ucs[id], '', '', '');
    }
  for (var j = 0; j < 3; j++) {
    var k = ['A', 'E', 'R'][j];
    general[k] = bm.createGeneralization(act[k], act.U, '');
  }
  log.push('actors associations ready');
  var rels = [
    { s: 'UC006', t: 'UC028', k: 'include' },
    { s: 'UC010', t: 'UC029', k: 'include' },
    {
      s: 'UC029',
      t: 'UC028',
      k: 'extend',
      condition: 'atividade de programação',
      ep: 'avaliar código',
    },
    {
      s: 'UC012',
      t: 'UC006',
      k: 'extend',
      condition: 'usuário solicita ajuda e modo permite',
      ep: 'consultar ajuda',
    },
  ];
  for (var i = 0; i < rels.length; i++) {
    var r = rels[i];
    r.model =
      r.k === 'include'
        ? um.createInclude(ucs[r.s], ucs[r.t], '')
        : um.createExtend(ucs[r.s], ucs[r.t], '');
    if (r.ep) {
      um.createExtensionPoint(ucs[r.t], r.ep);
      r.model.setDefinition('Condição: ' + r.condition + '; ponto de extensão: ' + r.ep);
      log.push('relationship ' + r.k + ' ' + r.s + ' ' + r.t);
    }
  }
  function drawUC(name, ids, isGlobal) {
    log.push('draw UC ' + name);
    var ed = factory.getUseCaseDiagramEditor(),
      dg = addD(ed.createUseCaseDiagram(ucp, name));
    var ps = {},
      ap = {},
      rows = isGlobal ? 10 : Math.max(ids.length, 4),
      height = rows * 115 + 150;
    var right = isGlobal ? 1310 : 720;
    var box = ed.createRect(point(215, 70), right - 225, height - 70);
    style(box);
    box.setLabel('Stacklyst');
    for (var i = 0; i < ids.length; i++) {
      var id = ucId(ids[i]),
        x = isGlobal ? 260 + Math.floor(i / 10) * 335 : 280,
        y = 130 + (isGlobal ? i % 10 : i) * 115;
      ps[id] = node(ed, ucs[id], x, y, isGlobal ? 270 : 360, 80);
      ps[id].setLabel(id + '\n' + wrap(String(ucs[id].getName()).slice(6), isGlobal ? 30 : 38));
    }
    var actorKeys = [];
    for (var k in D.participation) {
      if (
        D.participation[k].some(function (n) {
          return ids.indexOf(n) >= 0;
        })
      )
        actorKeys.push(k);
    }
    if (
      actorKeys.some(function (k) {
        return ['A', 'E', 'R'].indexOf(k) >= 0;
      }) &&
      actorKeys.indexOf('U') < 0
    )
      actorKeys.push('U');
    var ly = 130,
      ry = 140;
    for (var i = 0; i < actorKeys.length; i++) {
      var k = actorKeys[i],
        left = ['V', 'U'].indexOf(k) >= 0;
      var y = left ? ly : ry;
      ap[k] = node(ed, act[k], left ? 40 : right + 60, y, 100, 85);
      if (left) ly += isGlobal ? 430 : 235;
      else ry += Math.max(150, height / 5);
    }
    for (var k in ap)
      for (var i = 0; i < ids.length; i++) {
        var id = ucId(ids[i]);
        if (assoc[k + id]) ed.createLinkPresentation(assoc[k + id], ap[k], ps[id]);
      }
    for (var k in general) if (ap[k] && ap.U) ed.createLinkPresentation(general[k], ap[k], ap.U);
    for (var i = 0; i < rels.length; i++) {
      var r = rels[i];
      if (ps[r.s] && ps[r.t]) {
        var l = ed.createLinkPresentation(r.model, ps[r.s], ps[r.t]);
        safeProp(l, 'line.shape', 'line');
      }
    }
    note(
      ed,
      'Associação contínua: participação, sem ordem temporal. Generalização: triângulo aponta para Usuário autenticado.\n«include»: seta para o comportamento incluído. «extend»: seta para o caso base.\nUC012 → UC006 [solicita ajuda e modo permite]; UC029 → UC028 [atividade de programação].\nSessão válida é pré-condição. UC029 pode executar internamente; o executor externo participa quando acionado.',
      230,
      height + 45,
      isGlobal ? 1050 : 550
    );
    return dg;
  }
  drawUC(
    'UC00 Geral - Stacklyst completo',
    D.uc.map(function (u) {
      return parseInt(u.id.slice(2), 10);
    }),
    true
  );
  for (var g = 0; g < D.groups.length; g++) drawUC('UC' + D.groups[g][0], D.groups[g][1], false);
  print('Casos de uso criados');
  var clp = bm.createPackage(root, '02 Classes de dominio');
  var dbp = bm.createPackage(root, '03 Modelo relacional - entidades PK FK');
  var classes = {},
    tables = {},
    cr = [],
    dr = [];
  for (var i = 0; i < D.models.length; i++) {
    var m = D.models[i],
      c = bm.createClass(clp, m.name),
      t = bm.createClass(dbp, m.name);
    classes[m.name] = c;
    tables[m.name] = t;
    c.addStereotype('entidade de domínio');
    t.addStereotype('table');
    c.setDefinition(
      'Modelo de domínio derivado de prisma/schema.prisma. Associações substituem campos de chave estrangeira. Nenhuma operação de negócio foi atribuída artificialmente à entidade.'
    );
    t.setDefinition('prisma/schema.prisma\n' + m.constraints.join('\n'));
    var count = 0;
    for (var j = 0; j < m.fields.length; j++) {
      var f = m.fields[j];
      var label =
        f.name + (f.pk ? ' {PK}' : '') + (f.fk ? ' {FK}' : '') + (f.unique ? ' {UQ}' : '');
      var at = bm.createAttribute(t, label, f.type);
      at.setVisibility('public');
      at.setDefinition(f.definition);
      if (!f.fk && (count < 7 || f.pk)) {
        var ac = bm.createAttribute(c, f.name, f.type);
        ac.setVisibility('private');
        count++;
      }
    }
  }
  for (var i = 0; i < D.relations.length; i++) {
    var r = D.relations[i];
    var a = bm.createAssociation(
      classes[r.from],
      classes[r.to],
      '',
      r.from.toLowerCase() + 'Items',
      r.role
    );
    var ends = a.getMemberEnds();
    ends[0].setMultiplicityString(r.sourceMultiplicity);
    ends[1].setMultiplicityString(r.targetMultiplicity);
    a.setDefinition(r.definition);
    cr.push(a);
    var b = bm.createAssociation(
      tables[r.from],
      tables[r.to],
      r.fk.join(', ') + ' → ' + r.ref.join(', '),
      '',
      r.role
    );
    var e = b.getMemberEnds();
    e[0].setMultiplicityString(r.sourceMultiplicity);
    e[1].setMultiplicityString(r.targetMultiplicity);
    b.setDefinition(r.definition);
    dr.push(b);
  }
  function drawClasses(name, names, physical, overview) {
    var ed = factory.getClassDiagramEditor(),
      dg = addD(ed.createClassDiagram(physical ? dbp : clp, name)),
      ps = {},
      cols = overview ? 7 : 3;
    for (var i = 0; i < names.length; i++) {
      var n = names[i],
        m = (physical ? tables : classes)[n];
      var p = node(
        ed,
        m,
        50 + (i % cols) * 500,
        80 + Math.floor(i / cols) * (overview ? 230 : 680),
        380,
        0
      );
      ps[n] = p;
      safeProp(p, 'attribute.visibility', !overview);
      safeProp(p, 'operation.visibility', 'false');
    }
    for (var i = 0; i < D.relations.length; i++) {
      var r = D.relations[i];
      if (ps[r.from] && ps[r.to])
        ed.createLinkPresentation((physical ? dr : cr)[i], ps[r.from], ps[r.to]);
    }
    note(
      ed,
      physical
        ? 'Modelo relacional em notação UML. PK: chave primária; FK: chave estrangeira; UQ: unicidade.\n? indica campo opcional; [] indica vetor. Multiplicidades derivadas das relações e restrições Prisma.\nNão é um diagrama ER nativo da edição Professional. Definições dos elementos guardam índices e ações referenciais.'
        : 'Classes de domínio; atributos essenciais e associações com papéis e multiplicidades.\nOs papéis USER / ADMIN / EVALUATOR / RECRUITER são valores de UserRole, não subclasses persistidas.\nOperações pertencem aos serviços e módulos reais, apresentados na vista de serviços.\nAssociação simples não implica composição; FK com cascade, isoladamente, não prova composição UML.',
      40,
      Math.ceil(names.length / cols) * (overview ? 230 : 680) + 120,
      overview ? 1200 : 1200
    );
    return dg;
  }
  drawClasses(
    'CL00 Visao geral das classes',
    D.models.map(function (m) {
      return m.name;
    }),
    false,
    true
  );
  drawClasses(
    'MR00 Visao geral - 47 entidades',
    D.models.map(function (m) {
      return m.name;
    }),
    true,
    true
  );
  for (var g = 0; g < D.domains.length; g++) {
    var nm = D.domains[g][0],
      ns = D.domains[g][1];
    drawClasses('CL' + nm, ns, false, false);
    drawClasses('MR' + nm, ns, true, false);
  }
  // Real TypeScript types are distinct from persisted database tables.
  var ed = factory.getClassDiagramEditor(),
    cd = addD(ed.createClassDiagram(clp, 'CL11 Catalogo e contratos TypeScript'));
  var spec = [
    ['LearningCourse', ['id:string', 'title:string', 'language:string']],
    ['Lesson', ['id:string', 'title:string', 'language:string', 'xpReward:number']],
    [
      'LearningLesson',
      ['unitTitle:string', 'kind:lesson | review | project', 'prerequisites:string[]'],
    ],
    [
      'LessonStep',
      ['id:string', 'type:ExerciseType', 'xp:number', 'evaluation:contrato privado opcional'],
    ],
  ];
  var cp = {};
  for (var i = 0; i < spec.length; i++) {
    var c = bm.createClass(clp, spec[i][0]);
    c.addStereotype('TypeScript interface');
    for (var j = 0; j < spec[i][1].length; j++) {
      var a = spec[i][1][j].split(':');
      bm.createAttribute(c, a[0], a[1]);
    }
    cp[spec[i][0]] = node(ed, c, 50 + (i % 2) * 530, 80 + Math.floor(i / 2) * 350, 400, 170);
  }
  var gen = bm.createGeneralization(cp.LearningLesson.getModel(), cp.Lesson.getModel(), '');
  ed.createLinkPresentation(gen, cp.LearningLesson, cp.Lesson);
  function linkTypes(a, b, role, mul) {
    var r = bm.createAssociation(cp[a].getModel(), cp[b].getModel(), '', '', role);
    r.getMemberEnds()[1].setMultiplicityString(mul);
    ed.createLinkPresentation(r, cp[a], cp[b]);
  }
  linkTypes('LearningCourse', 'LearningLesson', 'lessons', '0..*');
  linkTypes('Lesson', 'LessonStep', 'steps', '0..*');
  note(
    ed,
    'Fonte: src/lib/learning/catalog-types.ts e src/lib/lessons/types.ts.\nLearningLesson estende Lesson. Vetores não impõem tamanho mínimo no contrato TypeScript.\nNão há tabelas Course, Lesson e LessonStep no schema. Identificadores de etapas podem materializar registros Quiz.\nO conteúdo privado de avaliação é removido por publicLesson antes da resposta ao navegador.',
    40,
    810,
    950
  );
  print('Classes e modelo relacional criados');
  var ap = bm.createPackage(root, '04 Atividades do negocio');
  for (var k = 0; k < D.activities.length; k++) {
    var f = D.activities[k],
      ae = factory.getActivityDiagramEditor(),
      ad = addD(ae.createActivityDiagram(ap, f.id + ' ' + f.name));
    txt(ae, f.role, 180, 20, 500);
    var initial = ae.createInitialNode('', point(330, 75)),
      pre = [],
      last = initial,
      y = 130;
    for (var j = 0; j < f.pre.length; j++) {
      var a = ae.createAction(wrap(f.pre[j], 40), point(200, y));
      a.setWidth(300);
      a.setHeight(60);
      style(a);
      ae.createFlow(last, a);
      pre.push(a);
      last = a;
      y += 110;
    }
    var dec = ae.createDecisionMergeNode(null, point(315, y));
    dec.setWidth(40);
    dec.setHeight(40);
    ae.createFlow(last, dec);
    txt(ae, wrap(f.q, 42), 410, y, 400);
    y += 115;
    var yes = [],
      no = [],
      dy = y;
    last = dec;
    for (var j = 0; j < f.yes.length; j++) {
      var a = ae.createAction(wrap(f.yes[j], 33), point(65, dy));
      a.setWidth(285);
      a.setHeight(70);
      style(a);
      var flow = ae.createFlow(last, a);
      if (j === 0) flow.getModel().setGuard('sim');
      yes.push(a);
      last = a;
      dy += 115;
    }
    var ny = y;
    last = dec;
    for (var j = 0; j < f.no.length; j++) {
      var a = ae.createAction(wrap(f.no[j], 33), point(500, ny));
      a.setWidth(285);
      a.setHeight(70);
      style(a);
      var flow = ae.createFlow(last, a);
      if (j === 0) flow.getModel().setGuard('não');
      no.push(a);
      last = a;
      ny += 115;
    }
    var endY = Math.max(dy, ny) + 45;
    if (f.loop !== undefined) {
      var l = ae.createFlow(last, pre[f.loop]);
      safeProp(l, 'line.shape', 'line_right_angle');
      var fin = ae.createFinalNode('', point(195, endY));
      ae.createFlow(yes[yes.length - 1], fin);
    } else {
      var merge = ae.createDecisionMergeNode(null, point(315, endY));
      merge.setWidth(35);
      merge.setHeight(35);
      ae.createFlow(yes[yes.length - 1], merge);
      ae.createFlow(no[no.length - 1], merge);
      var fin = ae.createFinalNode('', point(323, endY + 90));
      ae.createFlow(merge, fin);
    }
    if (f.note) note(ae, wrap(f.note, 95), 50, endY + 170, 780);
  }
  TM.endTransaction();
  astah.saveAs(rootPath + '/Stacklyst.asta');
  Files.write(
    Paths.get(rootPath + '/tools/native-build-log.txt'),
    new java.lang.String(
      'Diagrams: ' +
        diagrams.length +
        '\n' +
        diagrams
          .map(function (d) {
            return String(d.getName());
          })
          .join('\n') +
        '\n' +
        log.join('\n')
    ).getBytes('UTF-8')
  );
  print('SALVO: ' + diagrams.length + ' diagramas nativos em Stacklyst.asta');
} catch (e) {
  TM.abortTransaction();
  Files.write(
    Paths.get(rootPath + '/tools/error.txt'),
    new java.lang.String(
      log.join('\n') +
        '\n' +
        String(e) +
        '\n' +
        (e.stack || '') +
        '\n' +
        (e.javaException ? java.util.Arrays.toString(e.javaException.getStackTrace()) : '')
    ).getBytes('UTF-8')
  );
  print(String(e));
  throw e;
}
