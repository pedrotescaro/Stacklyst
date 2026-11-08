function structuralViews() {
  var concepts = {},
    tables = {},
    tableData = {};
  for (var key in D.conceptual.classes) {
    var info = D.conceptual.classes[key],
      c = bm.createClass(cp, info.name);
    c.setDefinition('Classe conceitual do domínio. Correspondência técnica: ' + info.source);
    info.attributes.forEach(function (a) {
      var parts = a.split(':');
      bm.createAttribute(c, parts[0], parts[1].trim());
    });
    info.operations.forEach(function (op) {
      bm.createOperation(c, op.replace(/\(\)$/, ''), '');
    });
    concepts[key] = c;
  }
  function xyScaled(xy) {
    return [xy[0] * 0.65, xy[1] * 0.5];
  }
  function curved(ed, a, b, pa, pb, label, ma, mb, bends) {
    var l = assoc(ed, a, b, pa, pb, label, ma, mb);
    if (bends) route(l, bends.map(xyScaled));
    return l;
  }
  for (var area in D.conceptual.views) {
    var v = D.conceptual.views[area],
      ed = factory.getClassDiagramEditor(),
      dg = ed.createClassDiagram(cp, 'CL-' + area + ' Classes ' + area.toLowerCase());
    record(dg, 'CL-' + area, 'classes conceituais em português');
    var ps = {},
      maxY = 0;
    v.names.forEach(function (k) {
      var xy = xyScaled(v.positions[k]);
      ps[k] = node(ed, concepts[k], xy[0], xy[1], 260, 0);
      maxY = Math.max(maxY, xy[1]);
    });
    v.edges.forEach(function (e) {
      var bends = null;
      if (area === 'DUELOS' && e.a === 'duelo' && e.b === 'parecer')
        bends = [
          [1130, 300],
          [1130, 1000],
        ];
      curved(ed, concepts[e.a], concepts[e.b], ps[e.a], ps[e.b], e.label, e.ma, e.mb, bends);
    });
    text(
      ed,
      'Visão conceitual: ' +
        v.names.length +
        ' classes essenciais. Atributos e operações resumem o domínio.\nDetalhes de implementação estão nas vistas específicas e na tabela de correspondência.',
      30,
      maxY + 230,
      1100
    );
  }
  var selected = {};
  for (var area in D.relationalViews)
    D.relationalViews[area].forEach(function (n) {
      selected[n] = true;
    });
  D.models.forEach(function (m) {
    if (!selected[m.name]) return;
    var c = bm.createClass(dbp, D.tableLabels[m.name]);
    c.addStereotype('tabela');
    c.setDefinition('Tabela real: ' + m.name + '\nFonte: prisma/schema.prisma\n' + m.definition);
    tables[m.name] = c;
    tableData[m.name] = m;
  });
  var layouts = {
    GERAL: {
      User: [900, 700],
      QuizAttempt: [900, 60],
      Duel: [1500, 60],
      Post: [1500, 700],
      Message: [1500, 1300],
      Company: [900, 1300],
      Job: [300, 1300],
      JobApplication: [300, 700],
      Event: [300, 60],
      EventParticipant: [600, 380],
    },
    APRENDIZAGEM: {
      User: [600, 500],
      LanguageTrail: [60, 60],
      Quiz: [1140, 60],
      QuizAttempt: [1140, 500],
      LearningCredential: [60, 940],
    },
    COMUNIDADE: {
      User: [600, 500],
      Post: [600, 60],
      Answer: [1140, 60],
      Message: [1140, 500],
      Notification: [60, 500],
    },
    DUELOS: {
      User: [60, 60],
      Duel: [600, 60],
      DuelSubmission: [600, 500],
      EvaluatorProfile: [60, 940],
      DuelEvaluation: [600, 940],
    },
    RECRUTAMENTO: {
      User: [60, 60],
      Company: [600, 60],
      Job: [1140, 60],
      JobRecruitmentStage: [1140, 500],
      JobApplication: [600, 500],
    },
    EVENTOS: {
      User: [60, 60],
      Event: [600, 60],
      EventParticipant: [600, 500],
      EventChallenge: [1140, 60],
    },
    IDENTIDADE: {
      User: [60, 500],
      ProfileCustomization: [600, 60],
      UserProfileAchievement: [600, 500],
      ProfileAchievementCatalog: [1140, 500],
    },
  };
  function typePT(t) {
    if (t.indexOf('String') === 0) return 'Texto';
    if (t.indexOf('Int') === 0) return 'Inteiro';
    if (t.indexOf('Float') === 0 || t.indexOf('Decimal') === 0) return 'Número';
    if (t.indexOf('Boolean') === 0) return 'Lógico';
    if (t.indexOf('DateTime') === 0) return 'DataHora';
    if (t.indexOf('Json') === 0) return 'Dados';
    return 'Enumeração';
  }
  // Same physical table is represented by one native model in every view.
  for (var n in tables) {
    var model = tableData[n];
    var relevant = model.fields.filter(function (f) {
      return f.pk || (f.fk && D.fieldLabels[f.name]);
    });
    var other = model.fields
      .filter(function (f) {
        return !f.pk && !f.fk && D.fieldLabels[f.name];
      })
      .slice(0, Math.max(0, 5 - relevant.length));
    relevant
      .concat(other)
      .slice(0, 6)
      .forEach(function (f) {
        bm.createAttribute(
          tables[n],
          (D.fieldLabels[f.name] || 'identificador') +
            (f.pk ? ' {CP}' : '') +
            (f.fk ? ' {CE}' : ''),
          typePT(f.type)
        );
      });
  }
  var generalPairs = [
    'User|QuizAttempt',
    'User|Duel',
    'User|Post',
    'User|Message',
    'User|Company',
    'Company|Job',
    'Job|JobApplication',
    'User|JobApplication',
    'User|EventParticipant',
    'Event|EventParticipant',
  ];
  for (var area in D.relationalViews) {
    var names = D.relationalViews[area],
      ed = factory.getClassDiagramEditor(),
      dg = ed.createClassDiagram(dbp, 'DER-' + area + ' Dados ' + area.toLowerCase());
    record(dg, 'DER-' + area, 'visão relacional reduzida em português');
    var ps = {},
      maxY = 0,
      pairs = {};
    names.forEach(function (n) {
      var xy = xyScaled(layouts[area][n]);
      ps[n] = node(ed, tables[n], xy[0], xy[1], 260, 0);
      maxY = Math.max(maxY, xy[1]);
    });
    D.relations.forEach(function (r) {
      var pair = r.parent + '|' + r.child;
      if (r.parent === r.child || !ps[r.parent] || !ps[r.child] || pairs[pair]) return;
      if (area === 'GERAL' && generalPairs.indexOf(pair) < 0) return;
      if (r.child === 'Message' && r.fk.indexOf('sender_id') < 0) return;
      if (r.child === 'Duel' && r.fk.indexOf('challenger_id') < 0) return;
      pairs[pair] = true;
      var label = r.fk
          .map(function (f) {
            return D.fieldLabels[f] || 'vínculo';
          })
          .join(', '),
        bends = null;
      if (area === 'DUELOS' && r.parent === 'Duel' && r.child === 'DuelEvaluation')
        bends = [
          [1130, 300],
          [1130, 1000],
        ];
      curved(
        ed,
        tables[r.parent],
        tables[r.child],
        ps[r.parent],
        ps[r.child],
        label,
        r.parentMultiplicity,
        r.childMultiplicity,
        bends
      );
    });
    text(
      ed,
      'Visão relacional reduzida: ' +
        names.length +
        ' tabelas e vínculos principais. CP = chave primária. CE = chave estrangeira.\nTodos os campos e relações auxiliares permanecem no dicionário técnico do banco.',
      30,
      maxY + 250,
      1300
    );
  }
}
structuralViews();
