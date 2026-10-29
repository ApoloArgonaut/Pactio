#!/usr/bin/env python3
import os
import glob
import subprocess

docs_dir = "/root/UX Project/Pactio/docs"
docx_dir = os.path.join(docs_dir, "docx")
pdf_dir = os.path.join(docs_dir, "pdf")
css_file = os.path.join(docs_dir, "pdf_style.css")

os.makedirs(docx_dir, exist_ok=True)
os.makedirs(pdf_dir, exist_ok=True)

md_files = glob.glob(os.path.join(docs_dir, "*.md"))
print(f"Encontrados {len(md_files)} documentos Markdown para procesar...")

for md_path in sorted(md_files):
    base_name = os.path.splitext(os.path.basename(md_path))[0]
    docx_path = os.path.join(docx_dir, f"{base_name}.docx")
    pdf_path = os.path.join(pdf_dir, f"{base_name}.pdf")
    
    print(f"\n[Procesando] {base_name}...")
    
    # 1. Generar DOCX
    cmd_docx = [
        "pandoc",
        md_path,
        "-o", docx_path
    ]
    try:
        subprocess.run(cmd_docx, check=True)
        size_kb = os.path.getsize(docx_path) / 1024
        print(f"  ✓ DOCX generado: {docx_path} ({size_kb:.1f} KB)")
    except Exception as e:
        print(f"  ✗ Error en DOCX: {e}")
        
    # 2. Generar PDF vía WeasyPrint con CSS corporativo
    cmd_pdf = [
        "pandoc",
        md_path,
        "--pdf-engine=weasyprint",
        f"--css={css_file}",
        "--metadata", f"title={base_name.replace('_', ' ').title()}",
        "-o", pdf_path
    ]
    try:
        subprocess.run(cmd_pdf, check=True, stderr=subprocess.DEVNULL)
        size_kb = os.path.getsize(pdf_path) / 1024
        print(f"  ✓ PDF generado: {pdf_path} ({size_kb:.1f} KB)")
    except Exception as e:
        print(f"  ✗ Error en PDF: {e}")

print("\n🎉 ¡Conversión de toda la documentación completada con éxito!")
