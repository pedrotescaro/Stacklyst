var Files = Java.type('java.nio.file.Files'),
  Paths = Java.type('java.nio.file.Paths');
var dir =
  'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-10-06';
var D = JSON.parse(String(Files.readString(Paths.get(dir + '/tools/revision-plan.json'))));
var TM = Java.type('com.change_vision.jude.api.inf.editor.TransactionManager');
var MF = Java.type('com.change_vision.jude.api.inf.editor.ModelEditorFactory');
var P = Java.type('java.awt.geom.Point2D.Double');
var bm = MF.getBasicModelEditor(),
  um = MF.getUseCaseModelEditor(),
  fac = astah.getDiagramEditorFactory();
var root = astah.getProject(),
  all = [],
  diags = [],
  warnings = [];
function walk(e) {
  all.push(e);
  try {
    diags = diags.concat(Java.from(e.getDiagrams()));
  } catch (x) {}
  try {
    Java.from(e.getOwnedElements()).forEach(walk);
  } catch (x) {}
}
walk(root);
function prop(p, k, v) {
  try {
    p.setProperty(k, String(v));
  } catch (e) {
    warnings.push(k + ': ' + e);
  }
}
function style(p, fill) {
  prop(p, 'fill.color', fill || '#FFFFFF');
  prop(p, 'line.color', '#39444F');
}
function txt(ed, s, x, y, w) {
  var p = ed.createText(s, new P(x, y));
  p.setWidth(w || 800);
  return p;
}
function node(ed, m, x, y, w, h) {
  var p = ed.createNodePresentation(m, new P(x, y));
  style(p);
  if (w) p.setWidth(w);
  if (h) p.setHeight(h);
  return p;
}
function named(s) {
  return all.filter(function (e) {
    return String(e.getName()) === s;
  })[0];
}
function dg(prefix) {
  return diags.filter(function (d) {
    return String(d.getName()).indexOf(prefix + ' ') === 0;
  })[0];
}
function removeDiagram(d) {
  if (!d) return;
  var e =
    String(d.getName()).indexOf('AN') === 0
      ? fac.getActivityDiagramEditor()
      : String(d.getName()).indexOf('UC') === 0
        ? fac.getUseCaseDiagramEditor()
        : fac.getClassDiagramEditor();
  e.delete(d);
}
function cleanTextNotes(d, ed) {
  Java.from(d.getPresentations()).forEach(function (p) {
    if (p.getType() === 'Note' || p.getType() === 'Text') ed.deletePresentation(p);
  });
}
TM.beginTransaction();
try {
  // Remove unsupported cases and obsolete business diagrams from this new revision.
  all
    .filter(function (e) {
      return D.removedCases.some(function (id) {
        return String(e.getName()).indexOf(id) === 0;
      });
    })
    .forEach(function (e) {
      bm.delete(e);
    });
  var ucs = {};
  all.forEach(function (e) {
    var n = String(e.getName()),
      mt = /^(UC\d{3})/.exec(n);
    if (mt && D.removedCases.indexOf(mt[1]) < 0) ucs[mt[1]] = e;
  });
  D.uc.forEach(function (u) {
    if (ucs[u.id]) ucs[u.id].setName(u.id + '\n' + u.name);
  });
  var visitor = named('Visitante');
  if (visitor) visitor.setName('Usuário');
  var up = named('01 Casos de uso'),
    clp = named('02 Classes de dominio'),
    ap = named('04 Atividades do negocio');
  diags
    .filter(function (d) {
      return String(d.getName()).indexOf('AN') === 0;
    })
    .forEach(removeDiagram);
  // Communities are outside the delivered scope, including the corresponding class/ER views.
  all
    .filter(function (e) {
      return ['Guild', 'GuildMember', 'GuildRole'].indexOf(String(e.getName())) >= 0;
    })
    .forEach(function (e) {
      bm.delete(e);
    });
  ['CL07', 'MR07'].forEach(function (id) {
    var d = dg(id);
    if (d) d.setName(id + ' Mensagens privadas');
  });
  // Overview aggregates map to every retained use case. They are not include relationships.
  removeDiagram(dg('UC00'));
  var ue = fac.getUseCaseDiagramEditor(),
    ud = ue.createUseCaseDiagram(up, 'UC00 Visao geral do sistema');
  var actors = {};
  ['Usuário', 'Usuário autenticado', 'Recrutador', 'Avaliador', 'Administrador'].forEach(
    function (a) {
      actors[a] = named(a) || um.createActor(up, a);
    }
  );
  var yByActor = {
    Usuário: 105,
    'Usuário autenticado': 460,
    Recrutador: 155,
    Avaliador: 425,
    Administrador: 660,
  };
  var aps = {};
  Object.keys(actors).forEach(function (a) {
    aps[a] = node(
      ue,
      actors[a],
      a === 'Usuário' || a === 'Usuário autenticado' ? 15 : 1190,
      yByActor[a],
      115,
      70
    );
  });
  var rect = ue.createRect(new P(160, 25), 995, 850);
  style(rect);
  txt(ue, 'Stacklyst', 180, 30, 850);
  D.overview.forEach(function (g, i) {
    var c = um.createUseCase(up, g[0] + '\n' + g[1]);
    c.addStereotype('visão agregada');
    c.setDefinition(
      'Detalhamento: ' +
        g[2]
          .map(function (n) {
            return 'UC' + ('000' + n).slice(-3);
          })
          .join(', ')
    );
    var col = i < 12 ? i % 3 : 3,
      row = i < 12 ? Math.floor(i / 3) : i - 12;
    var p = node(ue, c, 200 + col * 235, 95 + row * 175, 195, 100);
    var r = bm.createAssociation(actors[g[3]], c, '', '', '');
    var lp = ue.createLinkPresentation(r, aps[g[3]], p);
    prop(lp, 'line.shape', 'line_right_angle');
  });
  txt(
    ue,
    'G01–G16 agrupam os 52 casos detalhados. Acesso público: cadastro, login e consultas permitidas.\nDemais casos: usuário deve estar logado. Papéis especializados acumulam as funções do usuário autenticado.',
    170,
    895,
    1000
  );
  // Replace stale diagram notes in the detailed use-case views.
  diags
    .filter(function (d) {
      return /^UC\d{2} /.test(String(d.getName())) && String(d.getName()).indexOf('UC00') !== 0;
    })
    .forEach(function (d) {
      ue.setDiagram(d);
      Java.from(d.getPresentations()).forEach(function (p) {
        if (p.getType() === 'Note' && /Visitante|56 casos|13 casos/.test(String(p.getLabel())))
          p.setLabel(
            'Usuário deve estar logado nos casos protegidos. As permissões específicas constam da especificação.'
          );
      });
    });
  // Real operation owners are shared by the class diagrams.
  var owners = {};
  D.services.forEach(function (s) {
    var c = named(s.name);
    if (!c) c = bm.createClass(clp, s.name);
    Java.from(c.getOperations()).forEach(function (o) {
      bm.delete(o);
    });
    Java.from(c.getStereotypes()).forEach(function (st) {
      c.removeStereotype(st);
    });
    c.addStereotype(s.kind);
    c.setDefinition(
      'Implementação: ' +
        s.path +
        '\nMétodos reais. Assinaturas exibidas de forma resumida; parâmetros completos no código.'
    );
    s.ops.forEach(function (o) {
      var op = bm.createOperation(c, o[0], o[2]);
      op.setVisibility('public');
      op.setDefinition(s.path + '\n' + o[0] + '(' + o[1] + ')');
    });
    owners[s.name] = c;
  });
  diags
    .filter(function (d) {
      return /^CL\d{2} /.test(String(d.getName())) && String(d.getName()).indexOf('CL00') !== 0;
    })
    .forEach(function (d) {
      var id = String(d.getName()).slice(0, 4),
        spec = D.services.filter(function (s) {
          return s.diagrams.indexOf(id) >= 0;
        });
      if (!spec.length) return;
      var ed = fac.getClassDiagramEditor();
      ed.setDiagram(d);
      cleanTextNotes(d, ed);
      var old = Java.from(d.getPresentations()).filter(function (p) {
        return p.getType() === 'Class';
      });
      var ownNames = D.services.map(function (s) {
        return s.name;
      });
      old
        .filter(function (p) {
          return ownNames.indexOf(String(p.getModel().getName())) >= 0;
        })
        .forEach(function (p) {
          ed.deletePresentation(p);
        });
      old = Java.from(d.getPresentations()).filter(function (p) {
        return p.getType() === 'Class';
      });
      var bottom = 50;
      old.forEach(function (p) {
        var q = p.getLocation();
        p.setLocation(new P(q.x, q.y + 400));
        bottom = Math.max(bottom, q.y + 400 + p.getHeight());
      });
      spec.forEach(function (s, i) {
        var p = node(ed, owners[s.name], 40 + (i % 3) * 430, 50 + Math.floor(i / 3) * 290, 400, 0);
        prop(p, 'operation_compartment_visibility', 'true');
        prop(p, 'attribute_compartment_visibility', 'false');
        style(p, '#E9F2F7');
        s.entities.forEach(function (name) {
          var target = old.filter(function (t) {
            return String(t.getModel().getName()) === name;
          })[0];
          if (target) {
            var r = bm.createDependency(owners[s.name], target.getModel(), 'usa');
            var lp = ed.createLinkPresentation(r, p, target);
            prop(lp, 'line.shape', 'line_right_angle');
          }
        });
      });
      txt(
        ed,
        'Operações reais nas classes de serviço e módulos responsáveis. Entidades Prisma representam os dados.\nAssinaturas resumidas. Fontes: ' +
          spec
            .map(function (s) {
              return s.path;
            })
            .join('; '),
        40,
        Math.max(bottom + 60, spec.length > 3 ? 720 : 350),
        1200
      );
    });
  removeDiagram(dg('CL00'));
  var ce = fac.getClassDiagramEditor(),
    cd = ce.createClassDiagram(clp, 'CL00 Classes e responsabilidades principais');
  [
    'LessonProgress',
    'JobService',
    'EventService',
    'PostService',
    'XpService',
    'NotificationService',
  ].forEach(function (s, i) {
    var p = node(ce, owners[s], 35 + (i % 3) * 425, 55 + Math.floor(i / 3) * 290, 390, 0);
    style(p, '#E9F2F7');
    prop(p, 'operation_compartment_visibility', 'true');
    prop(p, 'attribute_compartment_visibility', 'false');
  });
  txt(
    ce,
    'Métodos conferidos no código. As vistas CL01–CL12 detalham as entidades e as dependências.\nClasses com estereótipo módulo representam funções exportadas, não classes TypeScript declaradas.',
    35,
    700,
    1220
  );
  // Recreate the business processes with native UML activity partitions and guarded decisions.
  D.activities.forEach(function (a) {
    var ed = fac.getActivityDiagramEditor(),
      ad = ed.createActivityDiagram(ap, a.id + ' ' + a.name),
      ps = {},
      lanes = [],
      labels = [];
    a.lanes.forEach(function (label, i) {
      var p = ed.createPartition(null, i ? lanes[i - 1] : null, label, true);
      p.setLocation(new P(20, 45 + i * (a.lanes.length > 1 ? 345 : 620)));
      p.setWidth(1220);
      p.setHeight(a.lanes.length > 1 ? 345 : 620);
      style(p, '#FFFFFF');
      lanes.push(p);
    });
    a.nodes.forEach(function (z) {
      var pt = new P(z[3], z[4]),
        p;
      if (z[1] === 'action') p = ed.createAction(z[2], pt);
      else if (z[1] === 'initial') p = ed.createInitialNode('Início', pt);
      else if (z[1] === 'final') p = ed.createFinalNode('Fim', pt);
      else p = ed.createDecisionMergeNode(null, pt);
      p.setWidth(z[5]);
      p.setHeight(z[6]);
      if (z[1] === 'action') style(p);
      ps[z[0]] = p;
      if (z[1] === 'decision')
        labels.push([txt(ed, z[2], z[3] - 38, z[4] - 95, 145), z[3] - 38, z[4] - 95]);
    });
    a.nodes.forEach(function (z) {
      ps[z[0]].setLocation(new P(z[3], z[4]));
    });
    labels.forEach(function (z) {
      z[0].setLocation(new P(z[1], z[2]));
    });
    a.edges.forEach(function (e) {
      var lp = ed.createFlow(ps[e[0]], ps[e[1]]);
      if (e[2]) lp.getModel().setGuard(e[2]);
      prop(lp, 'line.shape', 'line_right_angle');
      if (e[3]) {
        var from = ps[e[0]],
          to = ps[e[1]],
          f = from.getLocation(),
          t = to.getLocation(),
          pts = [new P(f.x + from.getWidth() / 2, f.y + from.getHeight() / 2)];
        e[3].forEach(function (v) {
          pts.push(new P(v[0], v[1]));
        });
        pts.push(new P(t.x + to.getWidth() / 2, t.y + to.getHeight() / 2));
        lp.setPoints(Java.to(pts, 'java.awt.geom.Point2D[]'));
      }
    });
    ad.setDefinition(a.purpose + '\nProcesso atual, fora do Stacklyst. ' + a.difficulty);
  });
  TM.endTransaction();
  astah.saveAs(dir + '/Stacklyst-seminario.asta');
  Files.writeString(
    Paths.get(dir + '/.build/astah-warnings.json'),
    JSON.stringify(warnings, null, 2)
  );
  print('Saved revised native Astah model');
} catch (e) {
  TM.abortTransaction();
  print(e.stack || e);
  java.lang.System.exit(1);
}
