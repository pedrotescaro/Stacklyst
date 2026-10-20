var Files = Java.type('java.nio.file.Files'),
  Paths = Java.type('java.nio.file.Paths');
var R =
  'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-10-20';
var D = JSON.parse(String(Files.readString(Paths.get(R + '/tools/diagram-plan.json'))));
var TM = Java.type('com.change_vision.jude.api.inf.editor.TransactionManager'),
  MF = Java.type('com.change_vision.jude.api.inf.editor.ModelEditorFactory'),
  P = Java.type('java.awt.geom.Point2D.Double');
var bm = MF.getBasicModelEditor(),
  fac = astah.getDiagramEditorFactory(),
  warnings = [],
  created = [];
function prop(p, k, v) {
  try {
    p.setProperty(k, String(v));
  } catch (e) {
    warnings.push(k + ': ' + e);
  }
}
function style(p, fill) {
  prop(p, 'fill.color', fill || '#FFFFFF');
  prop(p, 'line.color', '#203746');
  prop(p, 'font.color', '#132B3A');
}
function txt(ed, t, x, y, w) {
  var p = ed.createText(t, new P(x, y));
  try {
    p.setWidth(w || 800);
  } catch (e) {
    warnings.push('textwidth ' + e);
  }
  return p;
}
function node(ed, m, x, y, w, h) {
  var p = ed.createNodePresentation(m, new P(x, y));
  style(p);
  if (w) p.setWidth(w);
  if (h) p.setHeight(h);
  return p;
}
function association(ed, a, b, an, bn, label, amin, bmin) {
  var r = bm.createAssociation(a, b, label || '', '', '');
  var ends = Java.from(r.getMemberEnds());
  if (amin) ends[0].setMultiplicityString(amin);
  if (bmin) ends[1].setMultiplicityString(bmin);
  var p = ed.createLinkPresentation(r, an, bn);
  prop(p, 'line.shape', 'line_right_angle');
  prop(p, 'line.color', '#607584');
  var axy = an.getLocation(),
    bxy = bn.getLocation(),
    aw = an.getWidth(),
    ah = an.getHeight(),
    bw = bn.getWidth(),
    bh = bn.getHeight(),
    pts;
  if (Math.abs(axy.y - bxy.y) < 10) {
    var right = axy.x < bxy.x;
    pts = [
      new P(right ? axy.x + aw : axy.x, axy.y + ah / 2),
      new P(right ? bxy.x : bxy.x + bw, bxy.y + bh / 2),
    ];
  } else if (Math.abs(axy.x - bxy.x) < 10) {
    var down = axy.y < bxy.y;
    pts = [
      new P(axy.x + aw / 2, down ? axy.y + ah : axy.y),
      new P(bxy.x + bw / 2, down ? bxy.y : bxy.y + bh),
    ];
  } else {
    var down = axy.y < bxy.y,
      sy = down ? axy.y + ah : axy.y,
      ty = down ? bxy.y : bxy.y + bh,
      my = (sy + ty) / 2;
    pts = [
      new P(axy.x + aw / 2, sy),
      new P(axy.x + aw / 2, my),
      new P(bxy.x + bw / 2, my),
      new P(bxy.x + bw / 2, ty),
    ];
  }
  try {
    p.setPoints(Java.to(pts, 'java.awt.geom.Point2D[]'));
  } catch (e) {
    warnings.push('route ' + e);
  }
  return p;
}
function diagram(pkg, id, title) {
  var ed = fac.getClassDiagramEditor(),
    d = ed.createClassDiagram(pkg, id + ' ' + title);
  created.push({ id: id, name: String(d.getName()), type: 'classes' });
  return { ed: ed, d: d };
}
function conceptual(pkg, id, title, items, links, note) {
  print('BUILD ' + id);
  pkg = bm.createPackage(pkg, id + ' Modelo');
  var pair = diagram(pkg, id, title),
    ed = pair.ed,
    els = {},
    ps = {};
  items.forEach(function (z) {
    var c = bm.createClass(pkg, z[0]);
    c.setDefinition(
      z[6] ||
        'Conceito de domínio apresentado em português. Operações representam responsabilidades do negócio.'
    );
    if (z[2])
      z[2].forEach(function (a) {
        bm.createAttribute(c, a, 'texto');
      });
    if (z[3])
      z[3].forEach(function (o) {
        bm.createOperation(c, o, 'resultado');
      });
    var p = node(ed, c, z[4], z[5], z[7] || 235, 0);
    prop(p, 'attribute_type_visibility', 'false');
    prop(p, 'operation_return_type_visibility', 'false');
    prop(p, 'visibility_visibility', 'false');
    style(p, '#F5F9FA');
    els[z[0]] = c;
    ps[z[0]] = p;
  });
  if (id === 'CL00')
    links = links.filter(function (z) {
      return (
        !['Usuário', 'Trilha de aprendizado'].some(function (n) {
          return z[0] === n;
        }) &&
        !(z[0] === 'Candidatura' && z[1] === 'Etapa de seleção') &&
        !(z[0] === 'Vaga' && z[1] === 'Etapa de seleção')
      );
    });
  if (id === 'MER00')
    links = links.filter(function (z) {
      return [
        ['Tentativa de questão', 'Questão'],
        ['Resposta', 'Publicação'],
        ['Candidatura', 'Vaga'],
        ['Etapa de seleção', 'Vaga'],
        ['Participação em evento', 'Evento'],
      ].some(function (v) {
        return v[0] === z[0] && v[1] === z[1];
      });
    });
  links.forEach(function (z) {
    if (id === 'CL00' || id === 'MER00') z[2] = '';
    association(ed, els[z[0]], els[z[1]], ps[z[0]], ps[z[1]], z[2] || '', z[3], z[4]);
  });
  if (note)
    txt(
      ed,
      note,
      15,
      items.reduce(function (a, z) {
        return Math.max(
          a,
          z[5] + (z[2] ? z[2].length : 0) * 20 + (z[3] ? z[3].length : 0) * 20 + 105
        );
      }, 0) + 30,
      1060
    );
  return pair;
}
TM.beginTransaction();
try {
  print('PHASE conceptual');
  var root = astah.getProject(),
    pkg = bm.createPackage(root, 'Seminário 20-10-2026 em português');
  var cp = bm.createPackage(pkg, '01 Classes conceituais'),
    mp = bm.createPackage(pkg, '02 MER conceitual'),
    dp = bm.createPackage(pkg, '03 DER relacional'),
    sp = bm.createPackage(pkg, '04 Sequências completas e recortes');
  // Class models are independent from implementation names and service classes.
  conceptual(
    cp,
    'CL00',
    'Classes gerais do domínio',
    [
      ['Usuário', null, ['nome', 'papel'], ['estudar', 'candidatar-se'], 540, 20],
      ['Lição', null, ['título', 'pré-requisitos'], ['oferecer etapas'], 15, 20],
      ['Questão', null, ['enunciado', 'alternativas'], ['avaliar resposta'], 15, 240],
      [
        'Tentativa de questão',
        null,
        ['correta', 'experiência obtida'],
        ['registrar resultado'],
        280,
        240,
      ],
      ['Trilha de aprendizado', null, ['título'], ['organizar conteúdos'], 15, 460],
      ['Exercício', null, ['enunciado', 'linguagem'], ['receber solução'], 280, 460],
      ['Publicação', null, ['conteúdo'], ['publicar'], 810, 20],
      ['Resposta', null, ['conteúdo'], ['responder publicação'], 1075, 20],
      ['Mensagem', null, ['conteúdo'], ['enviar mensagem'], 810, 240],
      ['Duelo', null, ['situação'], ['receber soluções'], 540, 460],
      ['Avaliação de duelo', null, ['parecer'], ['avaliar solução'], 810, 460],
      ['Empresa', null, ['nome'], ['oferecer vagas'], 15, 710],
      ['Vaga', null, ['título', 'situação'], ['publicar', 'receber candidaturas'], 280, 710],
      ['Candidatura', null, ['situação'], ['avançar etapa'], 540, 710],
      ['Etapa de seleção', null, ['título', 'ordem'], ['organizar seleção'], 810, 710],
      ['Notificação', null, ['tipo', 'lida'], ['avisar usuário'], 1075, 710],
      ['Evento', null, ['título'], ['receber inscrições'], 1075, 240],
      ['Participação em evento', null, ['pontuação'], ['registrar participação'], 1075, 460],
    ],
    [
      ['Lição', 'Questão', 'contém'],
      ['Usuário', 'Tentativa de questão', 'realiza'],
      ['Questão', 'Tentativa de questão', 'recebe'],
      ['Trilha de aprendizado', 'Exercício', 'orienta estudo'],
      ['Usuário', 'Publicação', 'cria'],
      ['Publicação', 'Resposta', 'recebe'],
      ['Usuário', 'Mensagem', 'envia e recebe'],
      ['Usuário', 'Duelo', 'participa'],
      ['Duelo', 'Avaliação de duelo', 'recebe'],
      ['Empresa', 'Vaga', 'oferece'],
      ['Vaga', 'Candidatura', 'recebe'],
      ['Usuário', 'Candidatura', 'realiza'],
      ['Vaga', 'Etapa de seleção', 'organiza'],
      ['Candidatura', 'Etapa de seleção', 'está em'],
      ['Usuário', 'Notificação', 'recebe'],
      ['Evento', 'Participação em evento', 'possui'],
    ],
    'Visão conceitual geral. Os detalhes de dados aparecem no DER completo e nas visões específicas. Lição vem do catálogo de conteúdo.'
  );
  conceptual(
    cp,
    'CL01',
    'Classes de estudo e conclusão',
    [
      ['Aluno', null, ['nome', 'experiência total'], ['responder atividade'], 15, 20],
      ['Lição', null, ['título', 'pré-requisitos'], ['verificar acesso'], 330, 20],
      ['Etapa de lição', null, ['tipo', 'experiência prevista'], ['avaliar resposta'], 645, 20],
      ['Questão', null, ['enunciado', 'alternativas'], ['representar atividade'], 645, 290],
      [
        'Tentativa',
        null,
        ['correta', 'experiência obtida'],
        ['registrar primeira conclusão'],
        330,
        290,
      ],
      ['Progresso na linguagem', null, ['linguagem', 'nível'], ['acumular experiência'], 15, 290],
    ],
    [
      ['Aluno', 'Lição', 'estuda'],
      ['Lição', 'Etapa de lição', 'contém', '1', '1..*'],
      ['Etapa de lição', 'Questão', 'origina registro'],
      ['Aluno', 'Tentativa', 'realiza', '1', '0..*'],
      ['Questão', 'Tentativa', 'recebe', '1', '0..*'],
      ['Aluno', 'Progresso na linguagem', 'possui', '1', '0..*'],
    ],
    'Lição e etapa são conceitos do catálogo em arquivo. Questão e tentativa são persistidas ao avaliar o envio. Experiência é concedida na primeira conclusão correta.'
  );
  conceptual(
    cp,
    'CL02',
    'Classes de publicação de vaga',
    [
      ['Recrutador', null, ['nome', 'papel'], ['publicar vaga'], 15, 20],
      ['Empresa', null, ['nome', 'responsável'], ['oferecer oportunidade'], 345, 20],
      [
        'Vaga',
        null,
        ['título', 'situação', 'modalidade'],
        ['publicar', 'definir etapas'],
        345,
        300,
      ],
      ['Etapa de seleção', null, ['título', 'ordem', 'tipo'], ['ordenar processo'], 705, 300],
    ],
    [
      ['Recrutador', 'Empresa', 'é responsável'],
      ['Empresa', 'Vaga', 'oferece', '1', '0..*'],
      ['Vaga', 'Etapa de seleção', 'contém', '1', '0..*'],
    ],
    'Recrutador é um papel do usuário. A publicação exige acesso à empresa. A vaga e as etapas são criadas juntas.'
  );
  conceptual(
    cp,
    'CL03',
    'Classes de candidatura e acompanhamento',
    [
      ['Candidato', null, ['nome'], ['candidatar-se'], 15, 20],
      ['Vaga', null, ['título', 'situação'], ['receber candidatura'], 345, 20],
      ['Etapa de seleção', null, ['título', 'ordem'], ['definir situação'], 675, 20],
      [
        'Candidatura',
        null,
        ['situação', 'parecer', 'nota técnica'],
        ['registrar inscrição', 'alterar etapa'],
        345,
        300,
      ],
      ['Recrutador', null, ['papel'], ['avaliar candidatura'], 675, 300],
      ['Notificação', null, ['tipo', 'lida'], ['avisar candidato'], 15, 300],
    ],
    [
      ['Candidato', 'Candidatura', 'realiza', '1', '0..*'],
      ['Vaga', 'Candidatura', 'recebe', '1', '0..*'],
      ['Vaga', 'Etapa de seleção', 'contém', '1', '0..*'],
      ['Candidatura', 'Etapa de seleção', 'está em', '0..*', '0..1'],
      ['Recrutador', 'Candidatura', 'acompanha'],
      ['Candidato', 'Notificação', 'recebe', '1', '0..*'],
    ],
    'Uma candidatura por usuário e vaga. A etapa pertence à mesma vaga. A mudança é salva antes de solicitar o aviso.'
  );
  // Relational entities retain source identifiers in definitions, not on the projection.
  print('PHASE relational');
  var entities = {};
  D.models.forEach(function (z) {
    print('ENTITY ' + z.id);
    var c = bm.createClass(dp, z.name);
    c.setDefinition(z.definition);
    c.addStereotype('tabela');
    z.fields.forEach(function (a) {
      bm.createAttribute(c, a, 'texto');
    });
    entities[z.id] = c;
  });
  function der(id, title, positions, note, global) {
    print('DER ' + id);
    var pair = diagram(dp, id, title),
      ed = pair.ed,
      ps = {};
    Object.keys(positions).forEach(function (k) {
      var q = positions[k];
      ps[k] = node(ed, entities[k], q[0], q[1], global ? 235 : 270, 0);
      prop(ps[k], 'operation_compartment_visibility', 'false');
      prop(ps[k], 'attribute_type_visibility', 'false');
      style(ps[k], '#FFFFFF');
    });
    D.relations.forEach(function (r) {
      if (!ps[r.from] || !ps[r.to] || (id === 'DER03' && r.role === 'id_autor_ação')) return;
      association(
        ed,
        entities[r.from],
        entities[r.to],
        ps[r.from],
        ps[r.to],
        '',
        '0..*',
        r.optional ? '0..1' : '1'
      );
    });
    if (note)
      txt(
        ed,
        note,
        15,
        Object.keys(positions).reduce(function (a, k) {
          return Math.max(a, positions[k][1] + 245);
        }, 0) + 30,
        global ? 1800 : 1050
      );
    return pair;
  }
  der(
    'DER01',
    'Dados de estudo e conclusão',
    { User: [15, 20], Quiz: [690, 20], QuizAttempt: [355, 300], LanguageTrail: [15, 300] },
    'PK identifica a linha. FK liga tabelas. Restrição única: usuário + questão. Lição e etapa são catálogo em arquivo, sem tabela própria.',
    false
  );
  der(
    'DER02',
    'Dados de publicação de vaga',
    { User: [15, 20], Company: [350, 20], Job: [350, 300], JobRecruitmentStage: [720, 300] },
    'PK identifica a linha. FK liga tabelas. O responsável pela empresa é um usuário com permissão. A vaga e as etapas são persistidas na criação.',
    false
  );
  der(
    'DER03',
    'Dados de candidatura e notificação',
    {
      User: [15, 20],
      Company: [350, 20],
      Job: [685, 20],
      Notification: [15, 340],
      JobApplication: [350, 340],
      JobRecruitmentStage: [685, 340],
    },
    'Única: usuário + vaga. A etapa da candidatura é opcional. A notificação pertence ao usuário e referencia a vaga por identificador de recurso, sem FK para Vaga.',
    false
  );
  var groups = [
    ['User', 'LanguageTrail', 'EvaluatorApplication', 'EvaluatorProfile', 'Badge', 'UserBadge'],
    [
      'KnowledgeNode',
      'KnowledgeEdge',
      'LearningPath',
      'LearningPathNode',
      'Exercise',
      'ExerciseTestCase',
      'UserNodeProgress',
      'ExerciseRun',
      'ExerciseSubmission',
      'LearningEvent',
    ],
    [
      'Post',
      'Answer',
      'Quiz',
      'QuizAttempt',
      'QuizLibrary',
      'PostVote',
      'AnswerVote',
      'Reaction',
      'Bookmark',
    ],
    ['DuelRequest', 'Duel', 'DuelSolution', 'DuelSubmission', 'DuelVote', 'DuelEvaluation'],
    [
      'Company',
      'Job',
      'JobRecruitmentStage',
      'JobApplication',
      'Event',
      'EventChallenge',
      'EventParticipant',
    ],
    [
      'Message',
      'MessageReaction',
      'Notification',
      'Report',
      'Follow',
      'MobileState',
      'MobileDevice',
      'Guild',
      'GuildMember',
    ],
  ];
  var positions = {};
  groups.forEach(function (g, col) {
    g.forEach(function (id, row) {
      positions[id] = [20 + col * 360, 30 + row * 240];
    });
  });
  der(
    'DER00',
    'Banco de dados completo - 47 entidades',
    positions,
    '47 modelos de dados e 74 relações declaradas em prisma/schema.prisma. Nomes traduzidos para apresentação. Campos chave e atributos selecionados. Comunidade e suporte móvel permanecem no esquema, mesmo fora do roteiro de demonstração.',
    true
  );
  // MER omits foreign keys and keeps the domain relationships.
  var merids = [
    'User',
    'Quiz',
    'QuizAttempt',
    'LanguageTrail',
    'KnowledgeNode',
    'Exercise',
    'Post',
    'Answer',
    'Duel',
    'Company',
    'Job',
    'JobRecruitmentStage',
    'JobApplication',
    'Event',
    'EventParticipant',
    'Notification',
  ];
  function keyNoFK(fields) {
    return fields
      .filter(function (f) {
        return !/^(PK|FK) /.test(f);
      })
      .slice(0, 2);
  }
  var meritems = merids.map(function (id, i) {
    var z = D.models.filter(function (z) {
      return z.id === id;
    })[0];
    return [
      z.name,
      null,
      keyNoFK(z.fields),
      [],
      15 + (i % 4) * 320,
      20 + Math.floor(i / 4) * 210,
      z.definition,
      235,
    ];
  });
  function keyNoFK(fields) {
    return fields
      .filter(function (f) {
        return !/^(PK|FK) /.test(f);
      })
      .slice(0, 2);
  }
  var mlinks = [];
  D.relations.forEach(function (r) {
    if (merids.indexOf(r.from) >= 0 && merids.indexOf(r.to) >= 0)
      mlinks.push([D.mapping[r.from], D.mapping[r.to], '', '0..*', r.optional ? '0..1' : '1']);
  });
  conceptual(
    mp,
    'MER00',
    'Modelo entidade-relacionamento geral',
    meritems,
    mlinks,
    'Visão conceitual dos domínios principais, sem chaves estrangeiras. O DER completo mostra as 47 entidades persistidas.'
  );
  // Genuine UML sequence diagrams, with compact complete scenarios and small fragments.
  print('PHASE sequence');
  D.sequences.forEach(function (s) {
    var ed = fac.getSequenceDiagramEditor(),
      sd = ed.createSequenceDiagram(sp, s.id + ' ' + s.title),
      ls = [],
      calls = {};
    var step = s.complete ? 205 : 180,
      start = 60,
      gap = s.complete ? 41 : 61;
    s.participants.forEach(function (p, i) {
      p = String(p).replace(/\\n/g, '\n');
      var l = ed.createLifeline(p, start + i * step);
      style(l, '#F4F8FA');
      prop(l, 'lifeline_length', Math.max(230, 65 + s.messages.length * gap));
      ls.push(l);
    });
    s.messages.forEach(function (m, i) {
      var p;
      if (m[3] === 'return' && calls[m[1] + '-' + m[0]]) {
        p = null;
        var yy = 85 + i * gap,
          sx = start + m[0] * step + 55,
          tx = start + m[1] * step + 55,
          dir = tx > sx ? 1 : -1;
        for (var xx = sx; dir > 0 ? xx < tx - 12 : xx > tx + 12; xx += dir * 14) {
          var ee = dir > 0 ? Math.min(xx + 8, tx) : Math.max(xx - 8, tx);
          txt(ed, '−', Math.min(xx, ee), yy - 10, 13);
        }
        txt(ed, dir > 0 ? '>' : '<', tx - 5, yy - 10, 20);
        txt(ed, m[2], Math.min(sx, tx) + 15, yy - 24, Math.max(170, Math.abs(tx - sx) - 25));
      } else {
        p = ed.createMessage(m[2], ls[m[0]], ls[m[1]], 85 + i * gap);
        calls[m[0] + '-' + m[1]] = p;
      }
      if (p) prop(p, 'line.color', '#203746');
    });
    sd.setDefinition(
      'Cenário principal resumido. ' +
        JSON.stringify(s.source) +
        '\nRelação com código: ' +
        s.id +
        '. Alternativas e erros são explicados no roteiro e nos recortes.'
    );
    created.push({
      id: s.id,
      name: String(sd.getName()),
      type: 'sequência',
      complete: s.complete,
      source: s.source,
    });
  });
  TM.endTransaction();
  astah.saveAs(R + '/Stacklyst-seminario-revisado.asta');
  Files.writeString(
    Paths.get(R + '/.build/diagramas-criados.json'),
    JSON.stringify(created, null, 2)
  );
  Files.writeString(
    Paths.get(R + '/.build/astah-warnings.json'),
    JSON.stringify(warnings, null, 2)
  );
  print('SUCCESS ' + created.length + ' diagramas novos, base preservada.');
} catch (e) {
  TM.abortTransaction();
  print(e.stack || e);
  java.lang.System.exit(1);
}
