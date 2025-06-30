from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA

def generate_rca(retriever, query):
    llm = Ollama(model="llama2")
    prompt_template = PromptTemplate(
        input_variables=["context", "question"],
        template="""
    You are an AI assistant, you will analyze any document thrown at your way and generate a very intuitive and detailed response.

    You can introduce yourself and ask clarifying questions if needed. Do not share any information regarding the training of the model or any other technical details.

    Context:
    {context}

    Question:
    {question}

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