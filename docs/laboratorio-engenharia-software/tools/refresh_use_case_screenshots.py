from __future__ import annotations

import argparse
import json
import re
import tempfile
from io import BytesIO
from pathlib import Path, PurePosixPath
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree
from PIL import Image


REPO = Path(r"C:\Users\PEDRO\Documents\DevDeck")
ROOT = REPO / "docs" / "laboratorio-engenharia-software"
DEFAULT_DOCUMENT = ROOT / "entregaveis" / "04-casos-de-uso-stacklyst.docx"
CAPTURE_DIR = ROOT / "prototipos" / "atuais"

CAPTURES = {
    "UC003": CAPTURE_DIR / "uc003-uc007-perfil-progresso-atual.png",
    "UC004": CAPTURE_DIR / "uc004-trilhas-atual.png",
    "UC007": CAPTURE_DIR / "uc003-uc007-perfil-progresso-atual.png",
    "UC008": CAPTURE_DIR / "uc008-uc009-duelos-atual.png",
    "UC009": CAPTURE_DIR / "uc008-uc009-duelos-atual.png",
    "UC011": CAPTURE_DIR / "uc011-ranking-atual.png",
    "UC013": CAPTURE_DIR / "uc013-uc014-feed-atual.png",
    "UC014": CAPTURE_DIR / "uc013-uc014-feed-atual.png",
}

ALT_TEXT = {
    "UC003": "Captura atual do perfil autenticado do Stacklyst com dados do desenvolvedor e opção de edição.",
    "UC004": "Captura atual da trilha autenticada do Stacklyst com seção, atividades, bloqueios e progresso.",
    "UC007": "Captura atual do perfil autenticado do Stacklyst com XP, nível, posição e trilhas em andamento.",
    "UC008": "Captura atual da arena autenticada de duelos do Stacklyst com fila rápida e duelos abertos.",
    "UC009": "Captura atual da arena autenticada de duelos com seleção de linguagem e procura de oponente.",
    "UC011": "Captura atual do ranking autenticado do Stacklyst com classificação global, XP e marco de divisão.",
    "UC013": "Captura atual do feed autenticado do Stacklyst com compositor e publicações da comunidade.",
    "UC014": "Captura atual do feed autenticado do Stacklyst com controles de resposta, reação, salvamento e compartilhamento.",
}

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "pic": "http://schemas.openxmlformats.org/drawingml/2006/picture",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "v": "urn:schemas-microsoft-com:vml",
    "o": "urn:schemas-microsoft-com:office:office",
}
REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"


def paragraph_text(element: etree._Element) -> str:
    return "".join(element.xpath(".//w:t/text()", namespaces=NS))


def replace_paragraph_text(element: etree._Element, replacement: str) -> None:
    text_nodes = element.xpath(".//w:t", namespaces=NS)
    if not text_nodes:
        raise ValueError("Caption paragraph has no Word text node")
    text_nodes[0].text = replacement
    for text_node in text_nodes[1:]:
        text_node.text = ""


def caption_for(use_case_id: str) -> str:
    return (
        f"Protótipo de interface relacionado ao {use_case_id} — captura atual da plataforma "
        "autenticada em 22/08/2026."
    )


def image_bytes_for_package(package_path: str, replacement: Path) -> bytes:
    suffix = PurePosixPath(package_path).suffix.lower()
    if suffix not in {".jpg", ".jpeg"}:
        return replacement.read_bytes()

    with Image.open(replacement) as image:
        rgb_image = image.convert("RGB")
        output = BytesIO()
        rgb_image.save(output, format="JPEG", quality=95, subsampling=0, optimize=True)
        return output.getvalue()


def target_to_package_path(target: str) -> str:
    return str(PurePosixPath("word") / PurePosixPath(target))


def refresh_document(document_path: Path) -> dict[str, object]:
    missing = [str(path) for path in sorted(set(CAPTURES.values())) if not path.exists()]
    if missing:
        raise FileNotFoundError(f"Missing current captures: {missing}")

    with ZipFile(document_path) as source:
        infos = source.infolist()
        package = {info.filename: source.read(info.filename) for info in infos}

    document_xml = etree.fromstring(package["word/document.xml"])
    relationships_xml = etree.fromstring(package["word/_rels/document.xml.rels"])
    relationships = {
        relationship.get("Id"): relationship.get("Target")
        for relationship in relationships_xml.findall(f"{{{REL_NS}}}Relationship")
    }

    current_use_case: str | None = None
    use_case_relationships: dict[str, set[str]] = {}
    updated_captions: list[str] = []

    for child in document_xml.xpath("/w:document/w:body/*", namespaces=NS):
        text = paragraph_text(child)
        heading_match = re.search(r"Caso de Uso (UC\d{3})", text)
        if heading_match:
            current_use_case = heading_match.group(1)

        relationship_ids = child.xpath(".//a:blip/@r:embed|.//v:imagedata/@r:id", namespaces=NS)
        if current_use_case in CAPTURES and relationship_ids:
            use_case_relationships.setdefault(current_use_case, set()).update(relationship_ids)
            for doc_property in child.xpath(".//wp:docPr|.//pic:cNvPr", namespaces=NS):
                doc_property.set("descr", ALT_TEXT[current_use_case])
            for shape in child.xpath(".//v:shape", namespaces=NS):
                shape.set("alt", ALT_TEXT[current_use_case])
            for image_data in child.xpath(".//v:imagedata", namespaces=NS):
                image_data.set(f"{{{NS['o']}}}title", ALT_TEXT[current_use_case])

        caption_match = re.search(r"Protótipo (?:de interface|de acesso) relacionado ao (UC\d{3})", text)
        if caption_match and caption_match.group(1) in CAPTURES:
            use_case_id = caption_match.group(1)
            replace_paragraph_text(child, caption_for(use_case_id))
            updated_captions.append(use_case_id)

    missing_relationships = sorted(set(CAPTURES) - set(use_case_relationships))
    if missing_relationships:
        raise ValueError(f"No image relationship found for: {missing_relationships}")

    target_replacements: dict[str, Path] = {}
    for use_case_id, relationship_ids in use_case_relationships.items():
        for relationship_id in relationship_ids:
            target = relationships.get(relationship_id)
            if not target:
                raise ValueError(f"Relationship {relationship_id} has no target")
            package_path = target_to_package_path(target)
            replacement = CAPTURES[use_case_id]
            previous = target_replacements.setdefault(package_path, replacement)
            if previous != replacement:
                raise ValueError(
                    f"Conflicting captures for shared media {package_path}: {previous} and {replacement}"
                )

    for package_path, replacement in target_replacements.items():
        if package_path not in package:
            raise ValueError(f"Media target is missing from DOCX: {package_path}")
        package[package_path] = image_bytes_for_package(package_path, replacement)

    package["word/document.xml"] = etree.tostring(
        document_xml,
        xml_declaration=True,
        encoding="UTF-8",
        standalone=True,
    )

    with tempfile.NamedTemporaryFile(
        mode="wb",
        suffix=".docx",
        prefix=f"{document_path.stem}-",
        dir=document_path.parent,
        delete=False,
    ) as temporary_file:
        temporary_path = Path(temporary_file.name)

    try:
        with ZipFile(temporary_path, "w", ZIP_DEFLATED) as output:
            for info in infos:
                output.writestr(info, package[info.filename])
        with ZipFile(temporary_path) as validation:
            damaged_entry = validation.testzip()
            if damaged_entry:
                raise ValueError(f"Damaged DOCX entry after refresh: {damaged_entry}")
        temporary_path.replace(document_path)
    finally:
        temporary_path.unlink(missing_ok=True)

    return {
        "document": str(document_path),
        "updated_use_cases": sorted(use_case_relationships),
        "updated_captions": sorted(set(updated_captions)),
        "replaced_media": sorted(target_replacements),
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Replace stale use-case screenshots while preserving the current Word document structure."
    )
    parser.add_argument("document", nargs="?", type=Path, default=DEFAULT_DOCUMENT)
    args = parser.parse_args()
    print(json.dumps(refresh_document(args.document.resolve()), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
