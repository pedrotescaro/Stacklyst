// Focused general view: canonical UC numbers and repeated presentations of
// the SAME actor models keep the hierarchy apart from participation links.
function generalOverview() {
  var ed = factory.getUseCaseDiagramEditor(),
    dg = ed.createUseCaseDiagram(up, 'UC-GERAL Visão geral do sistema');
  record(dg, 'UC-GERAL', 'casos de uso UML');
  var boundary = ed.createRect(new Point(320, 400), 1780, 2420);
  prop(boundary, 'fill.color', '#FFFFFF');
  text(ed, 'Stacklyst — visão geral dos 24 casos de uso', 350, 420, 850);
  var hierarchy = {
    U: node(ed, actors.U, 1050, 0, 100, 110),
    E: node(ed, actors.E, 700, 180, 100, 110),
    R: node(ed, actors.R, 1050, 180, 100, 110),
    AD: node(ed, actors.AD, 1400, 180, 100, 110),
  };
  ['E', 'R', 'AD'].forEach(function (k) {
    var gp = ed.createLinkPresentation(gens[k], hierarchy[k], hierarchy.U);
    prop(gp, 'line.shape', 'line');
  });
  var ap = {
    U: node(ed, actors.U, 60, 1600, 100, 110),
    E: node(ed, actors.E, 2250, 1750, 100, 110),
    R: node(ed, actors.R, 2250, 2300, 100, 110),
    AD: node(ed, actors.AD, 2250, 2650, 100, 110),
    PUB: node(ed, actors.U, 2250, 610, 100, 110),
  };
  var external = um.createActor(up, 'Executor de código');
  ap.X = node(ed, external, 2250, 1300, 100, 110);
  var data = [
    ['UC003', 430, 550, 'U'],
    ['UC004', 430, 700, 'U'],
    ['UC005', 430, 850, 'U'],
    ['UC006', 430, 1000, 'U'],
    ['UC007', 430, 1150, 'U'],
    ['UC013', 430, 1300, 'U'],
    ['UC014', 430, 1450, 'U'],
    ['UC008', 430, 1600, 'U'],
    ['UC010', 430, 1750, 'U'],
    ['UC015', 430, 1900, 'U'],
    ['UC021', 430, 2050, 'U'],
    ['UC022', 430, 2200, 'U'],
    ['UC023', 430, 2350, 'U'],
    ['UC024', 430, 2500, 'U'],
    ['UC038', 430, 2650, 'U'],
    ['UC001', 1400, 480, 'PUB'],
    ['UC002', 1400, 690, 'PUB'],
    ['UC012', 1400, 800, null],
    ['UC028', 1400, 1000, null],
    ['UC029', 1400, 1300, 'X'],
    ['UC016', 1400, 1750, 'E'],
    ['UC017', 1400, 2200, 'R'],
    ['UC026', 1400, 2400, 'R'],
    ['UC019', 1400, 2650, 'AD'],
  ];
  var ps = {};
  data.forEach(function (a) {
    var model = ucs[a[0]],
      name = String(model.getName()).replace(/^UC\d+\s*/, ''),
      p = node(ed, model, a[1], a[2], 390, 105);
    p.setLabel(a[0] + '\n' + wrap(name, 35));
    ps[a[0]] = p;
    if (a[3]) {
      var actor = a[3] === 'PUB' ? actors.U : a[3] === 'X' ? external : actors[a[3]];
      var l = assoc(ed, actor, model, ap[a[3]], p, '');
      if (a[3] === 'U') route(l, [[230, a[2] + 52]]);
      else route(l, [[2040, a[2] + 52]]);
    }
  });
  function rel(a, b, kind, description, bend) {
    var m =
      kind === 'include'
        ? um.createInclude(ucs[a], ucs[b], '')
        : um.createExtend(ucs[a], ucs[b], '');
    m.setDefinition(description);
    var p = ed.createLinkPresentation(m, ps[a], ps[b]);
    prop(p, 'line.shape', 'curve');
    if (bend) route(p, [bend]);
  }
  rel(
    'UC001',
    'UC002',
    'extend',
    'Usuário sem conta escolhe cadastrar-se durante o acesso. Extensão opcional, conforme a seção 3.9 de Guedes.',
    [1850, 640]
  );
  rel(
    'UC006',
    'UC005',
    'extend',
    'O usuário resolve a atividade proposta no contexto do estudo da lição.',
    [860, 940]
  );
  rel(
    'UC006',
    'UC028',
    'include',
    'Avaliar a resposta submetida é comportamento obrigatório do exercício.',
    [1110, 985]
  );
  rel(
    'UC012',
    'UC006',
    'extend',
    'Solicitação de ajuda pelo usuário e modo de assistência permitido.',
    [1110, 875]
  );
  rel(
    'UC029',
    'UC028',
    'extend',
    'A atividade exige programação e avaliação de código.',
    [1870, 1170]
  );
  rel(
    'UC010',
    'UC029',
    'include',
    'O juiz executa a solução e os testes para avaliar a submissão competitiva.',
    [1140, 1610]
  );
  var note = ed.createNote(
    'Casos protegidos exigem login como pré-condição.\nCadastro, login e recuperação de acesso não exigem sessão.\nConsultas públicas seguem as pré-condições do seu caso.',
    new Point(850, 465)
  );
  prop(note, 'fill.color', '#FFFFFF');
  note.setWidth(450);
  text(
    ed,
    'Todos os 24 casos do catálogo consolidado estão nesta visão. Os números preservam as referências acadêmicas.\nA mesma identidade de ator é reapresentada junto às interações para evitar cruzamentos.\nHerança: triângulo vazio aponta para Usuário. «include»: obrigatório. «extend»: condicional.',
    340,
    2870,
    1780
  );
}
