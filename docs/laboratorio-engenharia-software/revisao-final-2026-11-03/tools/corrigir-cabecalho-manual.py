from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree

root = Path(__file__).resolve().parents[1]
file = root / 'entregaveis/05-manual-tecnico-da-plataforma.docx'
temporary = file.with_suffix('.corrigido.docx')
changed = 0
with ZipFile(file) as source, ZipFile(temporary, 'w', ZIP_DEFLATED) as target:
    for entry in source.infolist():
        data = source.read(entry.filename)
        if entry.filename.startswith('word/header') and entry.filename.endswith('.xml'):
            xml = etree.fromstring(data)
            for node in xml.xpath('//*[local-name()="t"]'):
                if node.text == 'Documento de Vis\u00e3o':
                    node.text = 'Manual T\u00e9cnico'
                    changed += 1
            data = etree.tostring(xml, xml_declaration=True, encoding='UTF-8', standalone=True)
        target.writestr(entry, data)
assert changed == 1, changed
temporary.replace(file)
print('Cabe\u00e7alho do manual corrigido.')
