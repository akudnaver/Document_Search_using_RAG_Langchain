from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import sys
import json
import uuid
from datetime import datetime

# Add the app directory to Python path to import your RAG modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'rca_genai_project'))

# Import your RAG pipeline modules
from app.ingestion import extract_text_from_file
from app.chunking import split_text_into_chunks
from app.embedding import generate_embeddings, store_in_faiss
from app.retriever import retrieve_similar_chunks
from app.generator import generate_refined_rca
from app.exporter import generate_pdf_report

app = FastAPI(title="RAG Pipeline API", version="1.0.0")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API requests/responses
class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    sources: List[dict] = []

class DocumentInfo(BaseModel):
    filename: str
    upload_date: str
    status: str
    chunks_count: Optional[int] = None

# In-memory storage for demo (replace with proper database in production)
conversations = {}
uploaded_documents = {}

@app.get("/")
async def root():
    return {"message": "RAG Pipeline API is running"}

@app.post("/upload-documents")
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload and process documents for RAG pipeline"""
    try:
        processed_files = []
        
        for file in files:
            # Save uploaded file
            file_id = str(uuid.uuid4())
            file_path = f"../rca_genai_project/data/raw_docs/{file_id}_{file.filename}"
            
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Process the document through your RAG pipeline
            try:
                # Extract text
                extracted_text = extract_text_from_file(file_path)
                
                # Chunk the text
                chunks = split_text_into_chunks(extracted_text)
                
                # Generate embeddings and store in FAISS
                embeddings = generate_embeddings(chunks)
                store_in_faiss(embeddings, chunks, file_id)
                
                # Store document info
                doc_info = DocumentInfo(
                    filename=file.filename,
                    upload_date=datetime.now().isoformat(),
                    status="processed",
                    chunks_count=len(chunks)
                )
                uploaded_documents[file_id] = doc_info
                processed_files.append({"file_id": file_id, "filename": file.filename, "chunks": len(chunks)})
                
            except Exception as e:
                # Handle processing errors
                doc_info = DocumentInfo(
                    filename=file.filename,
                    upload_date=datetime.now().isoformat(),
                    status="error"
                )
                uploaded_documents[file_id] = doc_info
                processed_files.append({"file_id": file_id, "filename": file.filename, "error": str(e)})
        
        return {"message": "Documents processed", "files": processed_files}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing documents: {str(e)}")

@app.get("/documents")
async def get_documents():
    """Get list of uploaded documents"""
    return {"documents": list(uploaded_documents.values())}

@app.post("/chat", response_model=ChatResponse)
async def chat_with_rag(chat_request: ChatMessage):
    """Chat endpoint that uses RAG pipeline to generate responses"""
    try:
        conversation_id = chat_request.conversation_id or str(uuid.uuid4())
        
        # Initialize conversation if new
        if conversation_id not in conversations:
            conversations[conversation_id] = []
        
        # Add user message to conversation
        conversations[conversation_id].append({
            "role": "user",
            "content": chat_request.message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Use RAG pipeline to generate response
        try:
            # Retrieve relevant chunks
            similar_chunks = retrieve_similar_chunks(chat_request.message, top_k=5)
            
            # Generate response using your LLM
            rag_response = generate_refined_rca(chat_request.message, similar_chunks)
            
            # Extract source information from chunks
            sources = [
                {
                    "content": chunk.get("content", "")[:200] + "...",
                    "source": chunk.get("source", "Unknown"),
                    "score": chunk.get("score", 0.0)
                }
                for chunk in similar_chunks[:3]  # Top 3 sources
            ]
            
        except Exception as e:
            # Fallback response if RAG pipeline fails
            rag_response = f"I apologize, but I encountered an error while processing your request: {str(e)}. Please try again or check if documents have been uploaded and processed."
            sources = []
        
        # Add AI response to conversation
        conversations[conversation_id].append({
            "role": "assistant",
            "content": rag_response,
            "timestamp": datetime.now().isoformat(),
            "sources": sources
        })
        
        return ChatResponse(
            response=rag_response,
            conversation_id=conversation_id,
            sources=sources
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@app.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get conversation history"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {"conversation_id": conversation_id, "messages": conversations[conversation_id]}

@app.post("/generate-report")
async def generate_report(chat_request: ChatMessage):
    """Generate PDF report from conversation"""
    try:
        conversation_id = chat_request.conversation_id
        if not conversation_id or conversation_id not in conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Get conversation history
        conversation = conversations[conversation_id]
        
        # Generate PDF report using your exporter
        report_path = generate_pdf_report(conversation, conversation_id)
        
        return FileResponse(
            path=report_path,
            filename=f"rca_report_{conversation_id}.pdf",
            media_type="application/pdf"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@app.delete("/documents/{file_id}")
async def delete_document(file_id: str):
    """Delete uploaded document"""
    if file_id not in uploaded_documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        # Remove from storage
        del uploaded_documents[file_id]
        
        # Clean up files (implement based on your storage strategy)
        # This might involve removing from FAISS index as well
        
        return {"message": "Document deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)