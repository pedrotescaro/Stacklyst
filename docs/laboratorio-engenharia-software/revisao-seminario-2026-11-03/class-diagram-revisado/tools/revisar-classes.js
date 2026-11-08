// Edição da cópia do modelo fornecido; preserva os IDs das dez classes.
var Files = Java.type('java.nio.file.Files'),
  Paths = Java.type('java.nio.file.Paths');
var TM = Java.type('com.change_vision.jude.api.inf.editor.TransactionManager');
var bm = Java.type(
  'com.change_vision.jude.api.inf.editor.ModelEditorFactory'
).getBasicModelEditor();
var Pt = Java.type('java.awt.geom.Point2D.Double');
var R =
  'C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-11-03/class-diagram-revisado';
var specs = {
  Evento: {
    xy: [45, 65],
    w: 390,
    a: [
      ['id', 'string'],
      ['criadorId', 'string'],
      ['empresaId', 'string'],
      ['titulo', 'string'],
      ['situacao', 'string'],
    ],
    o: [
      ['cadastrar', 'boolean'],
      ['alterar', 'boolean'],
      ['publicar', 'boolean'],
      ['cancelar', 'boolean'],
      ['buscarPorId', 'Evento', [['id', 'string']]],
    ],
  },
  Inscrição: {
    xy: [225, 420],
    w: 440,
    a: [
      ['id', 'string'],
      ['eventoId', 'string'],
      ['usuarioId', 'string'],
      ['pontuacao', 'int'],
      ['posicao', 'int'],
    ],
    o: [
      ['realizarInscricao', 'boolean'],
      ['cancelarInscricao', 'boolean'],
      ['atualizarPontuacao', 'void', [['pontos', 'int']]],
      ['obterClassificacao', 'int'],
    ],
  },
  Tentativa: {
    xy: [735, 65],
    w: 445,
    a: [
      ['id', 'string'],
      ['usuarioId', 'string'],
      ['atividadeId', 'string'],
      ['opcaoSelecionada', 'int'],
      ['acertou', 'boolean'],
    ],
    o: [
      ['registrarTentativa', 'boolean'],
      ['avaliarResposta', 'boolean'],
      ['consultarHistorico', 'List<Tentativa>', [['usuarioId', 'string']]],
    ],
  },
  Duelo: {
    xy: [1335, 65],
    w: 445,
    a: [
      ['id', 'string'],
      ['desafianteId', 'string'],
      ['adversarioId', 'string'],
      ['vencedorId', 'string'],
      ['situacao', 'string'],
    ],
    o: [
      ['iniciarDuelo', 'boolean'],
      ['registrarResultado', 'void', [['vencedorId', 'string']]],
      ['realizarDesempate', 'void'],
      ['buscarDuelos', 'List<Duelo>'],
    ],
  },
  Usuário: {
    xy: [735, 800],
    w: 445,
    a: [
      ['id', 'string'],
      ['nomeUsuario', 'string'],
      ['criadoEm', 'DateTime'],
    ],
    o: [
      ['cadastrar', 'boolean'],
      ['autenticar', 'boolean'],
      ['atualizarPerfil', 'boolean'],
      ['calcularPontos', 'int'],
      ['consultarTrilhas', 'List<string>'],
    ],
  },
  Candidatura: {
    xy: [45, 800],
    w: 470,
    a: [
      ['id', 'string'],
      ['vagaId', 'string'],
      ['usuarioId', 'string'],
      ['etapaId', 'string'],
      ['situacao', 'string'],
    ],
    o: [
      ['submeterCandidatura', 'boolean'],
      ['atualizarEtapa', 'boolean', [['etapa', 'string']]],
      ['cancelarCandidatura', 'boolean'],
      ['consultarPorUsuario', 'List<Candidatura>', [['usuarioId', 'string']]],
    ],
  },
  Publicação: {
    xy: [1335, 800],
    w: 470,
    a: [
      ['id', 'string'],
      ['autorId', 'string'],
      ['titulo', 'string'],
      ['conteudo', 'string'],
      ['criadoEm', 'DateTime'],
    ],
    o: [
      ['criarPublicacao', 'boolean'],
      ['editarPublicacao', 'boolean'],
      ['excluirPublicacao', 'boolean'],
      ['registrarReacao', 'void', [['tipo', 'string']]],
      ['buscarPorAutor', 'List<Publicação>', [['autorId', 'string']]],
    ],
  },
  Empresa: {
    xy: [735, 1270],
    w: 445,
    a: [
      ['id', 'string'],
      ['responsavelId', 'string'],
      ['nome', 'string'],
      ['criadoEm', 'DateTime'],
    ],
    o: [
      ['cadastrarEmpresa', 'boolean'],
      ['alterarEmpresa', 'boolean'],
      ['associarResponsavel', 'boolean', [['usuarioId', 'string']]],
      ['buscarPorId', 'Empresa', [['id', 'string']]],
    ],
  },
  Vaga: {
    xy: [45, 1270],
    w: 470,
    a: [
      ['id', 'string'],
      ['empresaId', 'string'],
      ['titulo', 'string'],
      ['nivel', 'string'],
      ['situacao', 'string'],
    ],
    o: [
      ['cadastrarVaga', 'boolean'],
      ['alterarVaga', 'boolean'],
      ['publicarVaga', 'boolean'],
      ['encerrarVaga', 'boolean'],
      ['buscarVagas', 'List<Vaga>', [['filtro', 'string']]],
    ],
  },
  Mensagem: {
    xy: [1335, 1270],
    w: 610,
    a: [
      ['id', 'string'],
      ['remetenteId', 'string'],
      ['destinatarioId', 'string'],
      ['conteudo', 'string'],
      ['criadoEm', 'DateTime'],
    ],
    o: [
      ['enviarMensagem', 'boolean'],
      ['excluirMensagem', 'boolean'],
      ['marcarComoLida', 'void'],
      [
        'buscarConversas',
        'List<Mensagem>',
        [
          ['remetenteId', 'string'],
          ['destinatarioId', 'string'],
        ],
      ],
    ],
  },
};
var classes = {},
  diagrams = [],
  all = [],
  seen = {};
var compact = {
  Evento: [40, 50, 355],
  Tentativa: [620, 50, 420],
  Duelo: [1130, 50, 430],
  Inscrição: [180, 335, 420],
  Usuário: [620, 620, 420],
  Candidatura: [40, 620, 470],
  Publicação: [1130, 620, 470],
  Empresa: [620, 1000, 420],
  Vaga: [40, 1000, 470],
  Mensagem: [1130, 1000, 610],
};
for (var n in specs) {
  specs[n].xy = compact[n].slice(0, 2);
  specs[n].w = compact[n][2];
}
function walk(e) {
  var id = String(e.getId());
  if (seen[id]) return;
  seen[id] = true;
  all.push(e);
  if (e.getOperations && e.getAttributes) classes[String(e.getName())] = e;
  if (e.getDiagrams)
    Java.from(e.getDiagrams()).forEach(function (d) {
      diagrams.push(d);
    });
  if (e.getOwnedElements) Java.from(e.getOwnedElements()).forEach(walk);
}
walk(astah.getProject());
var warnings = [];
function prop(p, k, v) {
  try {
    p.setProperty(k, String(v));
  } catch (x) {
    warnings.push(k + ': ' + x);
  }
}
TM.beginTransaction();
try {
  var types = {};
  [
    ['Texto', 'string'],
    ['Inteiro', 'int'],
    ['Lógico', 'boolean'],
    ['DataHora', 'DateTime'],
  ].forEach(function (pair) {
    classes[pair[0]].setName(pair[1]);
    types[pair[1]] = classes[pair[0]];
  });
  for (var name in specs) {
    var c = classes[name],
      s = specs[name];
    if (!c) throw 'Classe ausente: ' + name;
    var attrs = Java.from(c.getAttributes()).filter(function (a) {
      return String(a.getName()) !== '';
    });
    s.a.forEach(function (a, i) {
      var f = attrs[i] || bm.createAttribute(c, a[0], types[a[1]]);
      f.setName(a[0]);
      f.setType(types[a[1]]);
      f.setVisibility('private');
    });
    Java.from(c.getOperations()).forEach(function (o) {
      bm.delete(o);
    });
    s.o.forEach(function (o) {
      var m = bm.createOperation(c, o[0], o[1]);
      m.setVisibility('public');
      (o[2] || []).forEach(function (p) {
        bm.createParameter(m, p[0], p[1]);
      });
    });
    c.setDefinition(
      'Visão lógica do domínio Stacklyst, baseada no modelo fornecido e na imagem de referência. Atributos privados e operações públicas. IDs UUID são string. DateTime representa data e hora. List<T> representa uma coleção tipada. As operações sintetizam responsabilidades do domínio; não afirmam que os registros Prisma contenham métodos.'
    );
  }
  // As situações e os níveis continuam com seus domínios restritos no sistema;
  // nesta vista compacta, são strings. O antigo tipo genérico não é mais usado.
  if (classes['Enumeração']) bm.delete(classes['Enumeração']);
  diagrams.forEach(function (d) {
    d.setName('Classes principais do Stacklyst');
    var frame;
    Java.from(d.getPresentations()).forEach(function (p) {
      var type = String(p.getType());
      if (type === 'Frame') {
        frame = p;
        return;
      }
      if (type === 'Class') {
        var n = String(p.getModel().getName()),
          s = specs[n];
        if (!s) return;
        p.setLocation(new Pt(s.xy[0], s.xy[1]));
        p.setWidth(s.w);
        prop(p, 'fill.color', '#FFFFFF');
        prop(p, 'line.color', '#000000');
        prop(p, 'attribute_visibility', 'true');
        prop(p, 'operation_visibility', 'true');
      }
      if (type === 'Association') {
        var m = p.getModel(),
          ends = Java.from(m.getMemberEnds());
        ends.forEach(function (a) {
          a.setMultiplicityString(
            String(a.getType().getName()) === 'Usuário'
              ? '1'
              : String(a.getType().getName()) === 'Empresa' && String(m.getName()) === 'empresa'
                ? '1'
                : String(a.getType().getName()) === 'Vaga' && String(m.getName()) === 'vaga'
                  ? '1'
                  : String(a.getType().getName()) === 'Evento'
                    ? '1'
                    : '0..*'
          );
        });
        prop(p, 'line.shape', 'curve');
        prop(p, 'line.color', '#000000');
      }
    });
    if (frame) {
      frame.setLocation(new Pt(10, 10));
      frame.setWidth(1790);
      frame.setHeight(1290);
    }
  });
  TM.endTransaction();
  astah.saveAs(R + '/Class Diagram Stacklyst - revisado.asta');
  Files.writeString(Paths.get(R + '/tools/especificacao.json'), JSON.stringify(specs, null, 2));
  Files.writeString(Paths.get(R + '/tools/avisos.json'), JSON.stringify(warnings, null, 2));
  print('SUCCESS: 10 classes revisadas com atributos e operações nativos.');
} catch (e) {
  TM.abortTransaction();
  throw e;
}
