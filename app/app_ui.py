import streamlit as st
from ingestion import extract_from_pdf, extract_from_pptx, extract_from_docx
from chunking import chunk_text
from embedding import create_embeddings
from retriever import load_retriever
from generator import generate_rca
from exporter import save_as_pdf
import os
import tempfile
import pdfkit
import pandas as pd
from datetime import datetime

def main():
    st.set_page_config(page_title="Search Engine for any Documents", layout="wide")
    st.title("🔍 RAG Based Document Search Engine")

    with st.sidebar:
        st.header("📂 Upload Document")
        uploaded_file = st.file_uploader("Choose a file", type=["pdf", "pptx", "docx"])

    if uploaded_file:
        ext = uploaded_file.name.split(".")[-1].lower()
        st.success(f"Uploaded: {uploaded_file.name}")

        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
            tmp.write(uploaded_file.read())
            temp_path = tmp.name

        # Extract text
        st.subheader("📄 Extracted Text Preview")
        if ext == "pdf":
            text = extract_from_pdf(temp_path)
        elif ext == "pptx":
            text = extract_from_pptx(temp_path)
        elif ext == "docx":
            text = extract_from_docx(temp_path)
        else:
            st.error("Unsupported file type.")
            return

        st.text_area("Raw Document Text", text[:3000], height=300)

        # Chunk and create embeddings
        chunks = chunk_text(text)
        db = create_embeddings(chunks)

        # Ask query
        st.subheader("💬 Ask a Query")
        user_query = st.text_input("Enter your question:")

        if st.button("Generate a Summary"):
            retriever = load_retriever()
            result = generate_rca(retriever, user_query)

            st.subheader("📘 Refined Report")
            st.markdown(result)

            # Save as PDF
            path = "D:/Full_Stack_Dev/GenAI/rag_project/output"
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            if not os.path.exists(path):
                os.makedirs(path)
            pdf_path = os.path.join(path, f"summary_{timestamp}.pdf")
            path_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
            config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)
            pdfkit.from_string(result, pdf_path, configuration=config)

            with open(pdf_path, "rb") as f:
                st.download_button("📥 Download Summary into a PDF", f, file_name=f"Summary_{timestamp}.pdf")

if __name__ == "__main__":
    main()
