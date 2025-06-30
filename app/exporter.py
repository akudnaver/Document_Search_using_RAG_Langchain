import pdfkit
import markdown2

def save_as_pdf(content, output_path="output/qa_document.pdf"):
    html = markdown2.markdown(content)
    pdfkit.from_string(html, output_path)
