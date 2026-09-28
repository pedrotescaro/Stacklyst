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
  log = [],
  layoutInput = {};
var layouts = Files.exists(Paths.get(rootPath + '/tools/layouts.json'))
  ? JSON.parse(String(Files.readString(Paths.get(rootPath + '/tools/layouts.json'))))
  : {};
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
    ucs[u.id] = um.createUseCase(ucp, u.id + '\n' + wrap(u.name, 30));
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
    txt(ed, 'Stacklyst', 235, 80, 200);
    log.push('boundary ready');
    for (var i = 0; i < ids.length; i++) {
      var id = ucId(ids[i]),
        x = isGlobal ? 260 + Math.floor(i / 10) * 335 : 280,
        y = 130 + (isGlobal ? i % 10 : i) * 115;
      ps[id] = node(ed, ucs[id], x, y, isGlobal ? 270 : 360, 80);
      log.push('node ' + id);
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
    // Actor generalizations are drawn once in the global view; the same models are reused here.
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
  // UC00 is intentionally a compact introduction. The 12 functional diagrams below keep the complete coverage.
  var ge = factory.getUseCaseDiagramEditor(),
    gd = addD(ge.createUseCaseDiagram(ucp, 'UC00 Visao geral - Stacklyst'));
  txt(ge, 'STACKLYST — VISÃO GERAL DO SISTEMA', 70, 25, 1200);
  note(
    ge,
    'A visão geral mostra apenas os casos que explicam o produto: acesso, aprendizagem, duelos, comunidade, eventos, vagas e administração.\nOs casos UC001–UC030 e UC031–UC056 permanecem nos recortes detalhados. Linhas contínuas indicam participação; as relações tracejadas mostram apenas os dois reusos essenciais.',
    70,
    75,
    1500
  );
  var overviewIds = [1, 2, 3, 5, 6, 8, 10, 13, 15, 17, 19, 28, 29],
    overviewPos = {};
  ge.createRect(point(280, 150), 1000, 1050);
  txt(ge, 'Stacklyst', 300, 160, 940);
  var overviewPositions = [
    [1, 340, 220],
    [2, 340, 400],
    [3, 340, 620],
    [5, 340, 800],
    [6, 340, 980],
    [8, 660, 220],
    [10, 660, 400],
    [13, 660, 620],
    [15, 980, 220],
    [17, 980, 400],
    [19, 980, 580],
    [28, 660, 980],
    [29, 980, 980],
  ];
  for (var oi = 0; oi < overviewPositions.length; oi++) {
    var oz = overviewPositions[oi],
      oid = ucId(oz[0]),
      op = node(ge, ucs[oid], oz[1], oz[2], 270, 115);
    overviewPos[oid] = op;
  }
  var actorPos = {
    V: node(ge, act.V, 40, 230, 150, 80),
    U: node(ge, act.U, 40, 690, 150, 80),
    R: node(ge, act.R, 1330, 250, 150, 80),
    A: node(ge, act.A, 1330, 500, 150, 80),
    X: node(ge, act.X, 1330, 790, 150, 80),
  };
  function overviewAssociation(actor, id) {
    var key = actor + ucId(id);
    if (assoc[key]) return assoc[key];
    return bm.createAssociation(act[actor], ucs[ucId(id)], '', '', '');
  }
  var actorCases = { V: [1, 2], U: [3, 5, 6, 8, 10, 13, 15], R: [17], A: [19], X: [29] };
  for (var ak in actorCases)
    for (var aj = 0; aj < actorCases[ak].length; aj++) {
      var aid = ucId(actorCases[ak][aj]);
      if (overviewPos[aid]) {
        var al = ge.createLinkPresentation(
          overviewAssociation(ak, actorCases[ak][aj]),
          actorPos[ak],
          overviewPos[aid]
        );
      }
    }
  for (var gk in { A: 1, R: 1 }) ge.createLinkPresentation(general[gk], actorPos[gk], actorPos.U);
  var inc1 = ge.createLinkPresentation(rels[0].model, overviewPos.UC006, overviewPos.UC028);
  var inc2 = ge.createLinkPresentation(rels[1].model, overviewPos.UC010, overviewPos.UC029);
  note(
    ge,
    'Atores principais: Visitante, Usuário autenticado, Administrador, Recrutador e Executor de código.\nUC028 representa a avaliação da resposta; UC029 representa a execução de código quando a atividade exige.\nAtores especializados herdam as funções do Usuário autenticado.',
    300,
    1260,
    960
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
      t = bm.createClass(dbp, m.table);
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
      if (!f.fk && (count < 7 || f.pk || f.name === 'role' || f.name === 'total_xp')) {
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
    var b = bm.createAssociation(tables[r.from], tables[r.to], '', '', r.role);
    var e = b.getMemberEnds();
    e[0].setMultiplicityString(r.sourceMultiplicity);
    e[1].setMultiplicityString(r.targetMultiplicity);
    b.setDefinition(r.definition);
    dr.push(b);
  }
  function drawClasses(name, names, physical, overview) {
    print('Layout: ' + name);
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
      safeProp(p, 'attribute_compartment_visibility', !overview);
      safeProp(p, 'operation_compartment_visibility', 'false');
    }
    var li = { id: name, children: [], edges: [] },
      edgePres = {};
    for (var nk in ps) {
      var np = ps[nk];
      li.children.push({
        id: nk,
        width: Math.max(np.getWidth(), 250),
        height: np.getHeight() + 30,
      });
    }
    for (var i = 0; i < D.relations.length; i++) {
      var r = D.relations[i];
      if (ps[r.from] && ps[r.to]) {
        var lp = ed.createLinkPresentation((physical ? dr : cr)[i], ps[r.from], ps[r.to]);
        safeProp(lp, 'name_direction_visibility', 'false');
        if (overview) {
          safeProp(lp, 'roll_name_visibility', 'false');
          safeProp(lp, 'multiplicity_visibility', 'false');
        }
        li.edges.push({ id: 'e' + i, sources: [r.from], targets: [r.to] });
        edgePres['e' + i] = lp;
      }
    }
    layoutInput[name] = li;
    if (layouts[name]) {
      var lo = layouts[name];
      for (var i = 0; i < lo.children.length; i++) {
        var np = lo.children[i];
        ps[np.id].setLocation(point(np.x + 50, np.y + 70));
      }
      for (var i = 0; i < lo.edges.length; i++) {
        var le = lo.edges[i];
        if (le.sections && le.sections.length) {
          var sec = le.sections[0],
            pts = [sec.startPoint].concat(sec.bendPoints || []).concat([sec.endPoint]);
          try {
            edgePres[le.id].setPoints(
              Java.to(
                pts.map(function (p) {
                  return point(p.x + 50, p.y + 70);
                }),
                'java.awt.geom.Point2D[]'
              )
            );
          } catch (e) {
            print('Rota ' + le.id + ': ' + e);
          }
        }
      }
    }
    var bottom = 0;
    for (var nk in ps) bottom = Math.max(bottom, ps[nk].getLocation().y + ps[nk].getHeight());
    note(
      ed,
      physical
        ? 'PK: chave primária; FK: chave estrangeira; UQ: unicidade. ? opcional; [] vetor.\nModelo relacional em notação UML; nomes físicos de tabelas e restrições Prisma.'
        : 'Classes de domínio: atributos essenciais, papéis e multiplicidades.\nUserRole contém os papéis de acesso; eles não são subclasses persistidas.\nOperações reais estão na vista de serviços. Associação não presume composição.',
      40,
      bottom + 100,
      1000
    );
    return dg;
  }
  // Compact overview models are separate summaries; the complete schema remains in the domain views below.
  var ovp = bm.createPackage(root, '00 Vistas gerais simplificadas'),
    ovcp = bm.createPackage(ovp, 'Classes centrais'),
    ovtp = bm.createPackage(ovp, 'Entidades centrais'),
    ovClasses = {},
    ovTables = {};
  var overviewModels = [
    'User',
    'LanguageTrail',
    'LearningPath',
    'KnowledgeNode',
    'Exercise',
    'Duel',
    'Post',
    'Event',
    'Company',
    'Job',
    'JobApplication',
    'Notification',
  ];
  function sourceModel(n) {
    for (var q = 0; q < D.models.length; q++) if (D.models[q].name === n) return D.models[q];
    return null;
  }
  function shortFields(n, max, physical) {
    var m = sourceModel(n),
      out = [];
    if (!m) return out;
    for (var q = 0; q < m.fields.length; q++) {
      var f = m.fields[q];
      if (f.pk || f.fk) {
        out.push(f);
        if (out.length >= max) break;
      }
    }
    if (out.length < max)
      for (var q = 0; q < m.fields.length; q++) {
        var f = m.fields[q];
        if (!f.pk && !f.fk && out.indexOf(f) < 0) {
          out.push(f);
          if (out.length >= max) break;
        }
      }
    return out;
  }
  function compactClass(n, physical) {
    var m = sourceModel(n),
      c = bm.createClass(physical ? ovtp : ovcp, physical ? m.table : n);
    if (physical) c.addStereotype('table');
    else c.addStereotype('conceito central');
    var fs = shortFields(n, physical ? 4 : 3, physical);
    for (var q = 0; q < fs.length; q++) {
      var f = fs[q],
        lab = f.name + (physical ? (f.pk ? ' {PK}' : '') + (f.fk ? ' {FK}' : '') : '');
      var a = bm.createAttribute(c, lab, f.type);
      a.setVisibility('public');
    }
    c.setDefinition(
      'Resumo para visão geral; detalhes no diagrama ' + (physical ? 'MR' : 'CL') + ' por domínio.'
    );
    return c;
  }
  for (var oi = 0; oi < overviewModels.length; oi++) {
    ovClasses[overviewModels[oi]] = compactClass(overviewModels[oi], false);
    ovTables[overviewModels[oi]] = compactClass(overviewModels[oi], true);
  }
  var overviewEdges = [
    ['User', 'LanguageTrail', 'estuda', '0..*'],
    ['LanguageTrail', 'LearningPath', 'organiza', '1..*'],
    ['LearningPath', 'KnowledgeNode', 'abrange', '0..*'],
    ['KnowledgeNode', 'Exercise', 'pratica', '0..*'],
    ['User', 'Duel', 'participa', '0..*'],
    ['User', 'Post', 'publica', '0..*'],
    ['User', 'Event', 'cria ou participa', '0..*'],
    ['Company', 'Job', 'oferece', '0..*'],
    ['Job', 'JobApplication', 'recebe', '0..*'],
    ['User', 'JobApplication', 'envia', '0..*'],
    ['User', 'Notification', 'recebe', '0..*'],
  ];
  var ovRelC = [],
    ovRelT = [];
  for (var oi = 0; oi < overviewEdges.length; oi++) {
    var e = overviewEdges[oi];
    var ac = bm.createAssociation(ovClasses[e[0]], ovClasses[e[1]], '', e[2], e[3]);
    ac.getMemberEnds()[1].setMultiplicityString(e[3]);
    ac.setDefinition(
      'Relação conceitual resumida; tabelas associativas e detalhes estão nas vistas completas.'
    );
    ovRelC.push(ac);
    var at = bm.createAssociation(ovTables[e[0]], ovTables[e[1]], '', e[2], e[3]);
    at.getMemberEnds()[1].setMultiplicityString(e[3]);
    at.setDefinition('Relação essencial para a introdução ao modelo relacional.');
    ovRelT.push(at);
  }
  function drawCompact(name, physical) {
    var ed = factory.getClassDiagramEditor(),
      pkg = physical ? ovtp : ovcp,
      dg = addD(ed.createClassDiagram(pkg, name)),
      map = physical ? ovTables : ovClasses,
      ps = {},
      positions = [
        ['User', 550, 430],
        ['LanguageTrail', 50, 110],
        ['LearningPath', 380, 110],
        ['KnowledgeNode', 710, 110],
        ['Exercise', 1040, 110],
        ['Duel', 50, 710],
        ['Post', 380, 710],
        ['Event', 710, 710],
        ['Notification', 1040, 710],
        ['Company', 50, 1050],
        ['Job', 380, 1050],
        ['JobApplication', 710, 1050],
      ];
    for (var q = 0; q < positions.length; q++) {
      var z = positions[q],
        p = node(ed, map[z[0]], z[1], z[2], 270, 0);
      ps[z[0]] = p;
    }
    var rels2 = physical ? ovRelT : ovRelC;
    for (var q = 0; q < overviewEdges.length; q++) {
      var e = overviewEdges[q],
        lp = ed.createLinkPresentation(rels2[q], ps[e[0]], ps[e[1]]);
      safeProp(lp, 'name_direction_visibility', 'false');
      safeProp(lp, 'name_visibility', 'false');
      safeProp(lp, 'roll_name_visibility', 'false');
      safeProp(lp, 'role_name_visibility', 'false');
      safeProp(lp, 'multiplicity_visibility', physical ? 'true' : 'false');
      safeProp(lp, 'cardinality_visibility', physical ? 'true' : 'false');
    }
    note(
      ed,
      physical
        ? 'DER resumido: apenas entidades e chaves essenciais. PK = chave primária; FK = chave estrangeira. Tabelas associativas e colunas secundárias estão nas vistas MR01–MR10.'
        : 'Classes de domínio resumidas para apresentação inicial. Atributos são identificadores e conceitos centrais; operações e detalhes técnicos estão nas vistas complementares.',
      45,
      1370,
      1250
    );
    return dg;
  }
  drawCompact('CL00 Visao geral simplificada - classes centrais', false);
  drawCompact('MR00 Visao geral simplificada - entidades centrais', true);
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
    var initial = ae.createInitialNode('Início', point(330, 75)),
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
      var t = pre[f.loop];
      l.setPoints(
        Java.to(
          [
            point(last.getLocation().x + last.getWidth(), last.getLocation().y + 35),
            point(840, last.getLocation().y + 35),
            point(840, t.getLocation().y + 30),
            point(t.getLocation().x + t.getWidth(), t.getLocation().y + 30),
          ],
          'java.awt.geom.Point2D[]'
        )
      );
      var fin = ae.createFinalNode('Fim', point(195, endY));
      ae.createFlow(yes[yes.length - 1], fin);
    } else {
      var merge = ae.createDecisionMergeNode(null, point(315, endY));
      merge.setWidth(35);
      merge.setHeight(35);
      ae.createFlow(yes[yes.length - 1], merge);
      ae.createFlow(no[no.length - 1], merge);
      var fin = ae.createFinalNode('Fim', point(323, endY + 90));
      ae.createFlow(merge, fin);
    }
    if (f.note) note(ae, wrap(f.note, 95), 50, endY + 170, 780);
  }
  print('Atividades prontas');
  Files.write(
    Paths.get(rootPath + '/tools/layout-input.json'),
    new java.lang.String(JSON.stringify(layoutInput)).getBytes('UTF-8')
  );
  // Extra technical diagrams use the actual source-level services and learning pipeline.
  var tp = bm.createPackage(root, '05 Arquitetura e comportamento');
  var se = factory.getClassDiagramEditor(),
    sd = addD(se.createClassDiagram(clp, 'CL12 Servicos e operacoes reais'));
  var services = [
    [
      'JobService',
      [
        'listJobs',
        'getJobApplications',
        'getJobById',
        'createJob',
        'applyForJob',
        'updateApplicationStage',
        'createCompany',
      ],
      ['Job', 'JobApplication', 'Company'],
    ],
    [
      'EventService',
      [
        'listEvents',
        'getEventById',
        'getEventBySlug',
        'createEvent',
        'participate',
        'cancelParticipation',
        'deleteEvent',
      ],
      ['Event', 'EventParticipant'],
    ],
    ['XpService', ['awardXP', 'awardXPInTransaction'], ['User', 'LanguageTrail', 'Badge']],
  ];
  for (var i = 0; i < services.length; i++) {
    var s = services[i],
      m = bm.createClass(clp, s[0]);
    m.addStereotype('TypeScript object');
    for (var j = 0; j < s[1].length; j++) bm.createOperation(m, s[1][j], 'Promise');
    var sn = node(se, m, 40 + i * 480, 80, 360, 260);
    safeProp(sn, 'attribute_compartment_visibility', 'false');
    for (var j = 0; j < s[2].length; j++) {
      var cn = node(se, classes[s[2][j]], 40 + i * 480, 500 + j * 170, 330, 60);
      safeProp(cn, 'attribute_compartment_visibility', 'false');
      safeProp(cn, 'operation_compartment_visibility', 'false');
    }
  }
  note(
    se,
    'Operações existentes em src/services/job.service.ts, event.service.ts e xp.service.ts.\nRetornos assíncronos resumidos como Promise; assinaturas detalhadas permanecem no código.\nAs entidades Prisma não recebem métodos artificiais. Dependências indicam uso, não herança.',
    40,
    1100,
    1350
  );
  print('Servicos prontos');
  var ce = factory.getClassDiagramEditor(),
    ccd = addD(ce.createClassDiagram(tp, 'TC01 Pacotes e dependencias'));
  var comps = [
    ['Web\nNext.js', 50, 100],
    ['Route Handlers', 400, 100],
    ['Auth e RBAC', 750, 100],
    ['Supabase Auth', 1100, 100],
    ['Catálogo versionado', 50, 400],
    ['Avaliação e progresso', 400, 400],
    ['Serviços de domínio', 750, 400],
    ['Execução isolada\nQuickJS ou provedor remoto', 1100, 400],
    ['Prisma', 400, 750],
    ['PostgreSQL', 750, 750],
  ];
  var cps = [];
  for (var i = 0; i < comps.length; i++) {
    var s = comps[i];
    print('Componente ' + s[0]);
    var m = bm.createClass(tp, s[0].replace(/\n/g, ' '));
    cps.push(node(ce, m, s[1], s[2], 255, 100));
  }
  var deps = [
    [0, 1],
    [1, 2],
    [2, 3],
    [1, 5],
    [1, 6],
    [5, 4],
    [5, 7],
    [5, 8],
    [6, 8],
    [8, 9],
  ];
  for (var i = 0; i < deps.length; i++) {
    var a = cps[deps[i][0]],
      b = cps[deps[i][1]];
    ce.createLinkPresentation(bm.createDependency(a.getModel(), b.getModel(), ''), a, b);
  }
  note(
    ce,
    'Dependências do cliente web e da API. Rotas validam sessão, entrada e permissões.\nJavaScript/TypeScript podem executar no sandbox QuickJS interno; outras linguagens usam provedores externos.\nFalha de programa e indisponibilidade do executor são resultados diferentes.',
    50,
    980,
    1280
  );
  print('Componentes prontos');
  var ste = factory.getStateMachineDiagramEditor(),
    std = addD(ste.createStatemachineDiagram(tp, 'TC02 Estados derivados da licao'));
  var si = ste.createInitialPseudostate(null, point(70, 210));
  var stateDefs = [
      ['Bloqueada\nNOT_STARTED', 260, 60],
      ['Disponível\nAVAILABLE', 260, 350],
      ['Em andamento\nIN_PROGRESS', 760, 350],
      ['Concluída\nCOMPLETED', 760, 60],
    ],
    sts = [];
  for (var i = 0; i < stateDefs.length; i++) {
    var s = stateDefs[i],
      p = ste.createState(s[0], null, point(s[1], s[2]));
    p.setWidth(220);
    p.setHeight(100);
    style(p);
    sts.push(p);
  }
  function trans(a, b, event, guard) {
    var t = ste.createTransition(a, b);
    if (event) t.getModel().setEvent(event);
    if (guard) t.getModel().setGuard(guard);
    return t;
  }
  trans(si, sts[0], '', 'pré-requisito pendente');
  trans(si, sts[1], '', 'acesso permitido; sem tentativa');
  trans(sts[0], sts[1], 'recarregar', 'pré-requisitos concluídos');
  trans(sts[1], sts[2], 'salvar primeira tentativa', '');
  trans(sts[2], sts[3], 'salvar acerto', 'última etapa avaliável');
  trans(sts[2], sts[2], 'salvar tentativa', 'há etapas pendentes');
  trans(sts[3], sts[3], 'revisar', 'sem XP adicional');
  note(
    ste,
    'Estados derivados do progresso persistido. Ao reabrir, uma lição também pode ser reconstruída diretamente\nem IN_PROGRESS ou COMPLETED a partir das tentativas salvas. O diagrama destaca a evolução durante o estudo.\nLer uma explicação não conclui uma etapa avaliável. Não há estado MASTERED neste contrato.',
    70,
    650,
    1080
  );
  print('Estados prontos');
  var qe = factory.getClassDiagramEditor(),
    qd = addD(qe.createClassDiagram(tp, 'TC03 Submissao e transacao - sucesso'));
  var flowClasses = [
    ['1 Estudante', 60, 180],
    ['2 LessonClient', 320, 180],
    ['3 API de tentativa', 580, 180],
    ['4 Avaliador', 840, 180],
    ['5 Persistencia', 1100, 180],
    ['6 PostgreSQL', 1100, 430],
  ];
  var flowNodes = [];
  for (var i = 0; i < flowClasses.length; i++) {
    var fs = flowClasses[i],
      fm = bm.createClass(tp, fs[0]);
    flowNodes.push(node(qe, fm, fs[1], fs[2], 230, 90));
  }
  for (var i = 0; i < flowNodes.length - 1; i++) {
    var dep = bm.createDependency(flowNodes[i].getModel(), flowNodes[i + 1].getModel(), 'envia');
    qe.createLinkPresentation(dep, flowNodes[i], flowNodes[i + 1]);
  }
  note(
    qe,
    'Cenário de sucesso: acesso permitido e avaliação disponível. A API valida sessão, limite e entrada; o avaliador usa conteúdo canônico.\nAtividades de código acionam executor isolado. A persistência usa transação e lock por usuário; primeira conclusão elegível concede XP.\nRepetição preserva XP. Timeout/conflito causa rollback e resposta PROGRESS_SAVE_UNAVAILABLE.\nA ordem detalhada de mensagens permanece descrita na seção 9.4 do documento 04.',
    50,
    700,
    1250
  );
  TM.endTransaction();
  Files.write(
    Paths.get(rootPath + '/tools/layout-input.json'),
    new java.lang.String(JSON.stringify(layoutInput)).getBytes('UTF-8')
  );
  astah.saveAs(rootPath + '/Stacklyst-revisado-simplificado.asta');
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
        (e.getStackTrace ? java.util.Arrays.toString(e.getStackTrace()) : '')
    ).getBytes('UTF-8')
  );
  print(String(e));
  throw e;
}
