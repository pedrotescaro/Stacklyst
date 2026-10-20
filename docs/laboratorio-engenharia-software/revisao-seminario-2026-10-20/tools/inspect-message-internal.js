function info(o) {
  print('CLASS ' + o.getClass());
  Java.from(o.getClass().getDeclaredMethods()).forEach(function (m) {
    print(m);
  });
  Java.from(o.getClass().getDeclaredFields()).forEach(function (f) {
    print(f);
  });
}
function walk(e) {
  try {
    Java.from(e.getDiagrams()).forEach(function (d) {
      if (String(d.getName()).indexOf('SQ01 Concluir') === 0) {
        Java.from(d.getPresentations())
          .filter(function (p) {
            return p.getType() === 'Message';
          })
          .slice(0, 1)
          .forEach(function (p) {
            info(p);
            info(p.getModel());
          });
      }
    });
  } catch (x) {
    print(x);
  }
  try {
    Java.from(e.getOwnedElements()).forEach(walk);
  } catch (x) {}
}
walk(astah.getProject());
