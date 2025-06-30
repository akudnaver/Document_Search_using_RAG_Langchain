# RAG Chat Assistant

A production-ready ChatGPT-like interface integrated with your RAG (Retrieval-Augmented Generation) pipeline.

## Features

- **Modern Chat Interface**: ChatGPT-inspired UI with real-time messaging
- **Document Upload**: Support for PDF, DOCX, and PPTX files
- **RAG Integration**: Seamlessly connects to your existing RAG pipeline
- **Conversation Management**: Save and manage multiple chat sessions
- **Source Citations**: Display relevant document sources for AI responses
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Architecture

### Frontend (React + TypeScript)
- Modern React application with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Responsive design with mobile-first approach

### Backend (FastAPI)
- RESTful API built with FastAPI
- Integrates with your existing RAG pipeline
- File upload and processing endpoints
- CORS enabled for frontend communication

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Run the startup script (creates venv and installs dependencies)
python start.py
```

The backend server will start at `http://localhost:8000`

### 2. Frontend Setup

The React frontend is already configured and running. It will automatically connect to your backend API.

### 3. RAG Pipeline Integration

The backend is designed to integrate with your existing RAG pipeline structure:

```
rca_genai_project/
├── app/
│   ├── ingestion.py    # Your text extraction logic
│   ├── chunking.py     # Your text chunking logic
│   ├── embedding.py    # Your embedding generation
│   ├── retriever.py    # Your similarity search
│   ├── generator.py    # Your LLM response generation
│   └── exporter.py     # Your PDF report generation
```

### 4. Configuration

Update the API endpoints in `src/services/api.ts` if you need to change the backend URL:

```typescript
const API_BASE_URL = 'http://localhost:8000';
```

## Usage

1. **Upload Documents**: Use the "Docs" tab in the sidebar to upload PDF, DOCX, or PPTX files
2. **Start Chatting**: Click "New Chat" and start asking questions about your uploaded documents
3. **View Sources**: AI responses include source citations from your documents
4. **Manage Conversations**: All conversations are saved and can be accessed from the sidebar

## API Endpoints

- `POST /upload-documents`: Upload and process documents
- `POST /chat`: Send messages and get AI responses
- `GET /documents`: List uploaded documents
- `GET /conversations/{id}`: Get conversation history
- `POST /generate-report`: Generate PDF reports from conversations

## Customization

### Styling
- Modify Tailwind classes in React components
- Update the color scheme in `tailwind.config.js`

### RAG Pipeline
- Update the import statements in `backend/main.py` to match your module structure
- Modify the processing logic in the API endpoints to use your specific implementations

### Features
- Add authentication by implementing user management
- Extend the document types by updating file validation
- Add more export formats by extending the report generation

## Development

### Frontend Development
```bash
npm run dev
```

### Backend Development
```bash
cd backend
python main.py
```

### API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

## Production Deployment

### Frontend
```bash
npm run build
```

### Backend
Use a production ASGI server like Gunicorn with Uvicorn workers:

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

## Troubleshooting

1. **CORS Issues**: Ensure the frontend URL is added to the CORS origins in `backend/main.py`
2. **File Upload Issues**: Check file permissions and ensure the `data/raw_docs/` directory exists
3. **RAG Pipeline Errors**: Verify your RAG modules are properly imported and configured

## Next Steps

1. Replace the simulated responses with your actual RAG pipeline
2. Add user authentication and session management
3. Implement persistent storage for conversations and documents
4. Add more document processing capabilities
5. Deploy to production with proper security measures