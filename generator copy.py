from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA

def generate_rca(retriever, query):
    llm = Ollama(model="smollm2", temperature=0.1)
    prompt_template = PromptTemplate(
        input_variables=["context", "question"],
        template="""
    You are an RCA assistant. Use the context below to generate a refined RCA report in the following format:
    1. **Incident Summary**
    2. **Historical Similar Incidents**
    3. **Root Cause Analysis**
    4. **Recommendations**

    Context:
    {context}

    Question:
    {question}

    RCA Report:
    """)

    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": prompt_template}
    )

    response = qa_chain.invoke({"query": query})

    answer = response["result"]

    return answer.strip() if answer else "No relevant information found."