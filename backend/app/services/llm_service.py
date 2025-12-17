from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser
from pinecone import Pinecone
import re

from app.config import get_settings
from app.prompts.manim_prompt import MANIM_SYSTEM_PROMPT, MANIM_USER_PROMPT

settings = get_settings()


def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=settings.google_api_key
    )


def get_vectorstore():
    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = pc.Index(settings.pinecone_index)
    return PineconeVectorStore(
        index=index,
        embedding=get_embeddings(),
        text_key="text"
    )


def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-pro",
        google_api_key=settings.google_api_key,
        temperature=0.7
    )


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


def extract_code(text: str) -> str:
    """Extract Python code from LLM response."""
    # Try to find code blocks
    code_match = re.search(r'```python\n(.*?)```', text, re.DOTALL)
    if code_match:
        return code_match.group(1).strip()
    code_match = re.search(r'```\n(.*?)```', text, re.DOTALL)
    if code_match:
        return code_match.group(1).strip()
    return text.strip()


async def generate_manim_script(user_prompt: str) -> str:
    """Generate Manim script from user prompt using RAG."""
    vectorstore = get_vectorstore()
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    llm = get_llm()

    prompt = ChatPromptTemplate.from_messages([
        ("system", MANIM_SYSTEM_PROMPT),
        ("human", MANIM_USER_PROMPT)
    ])

    chain = (
        {"context": retriever | format_docs, "user_prompt": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    result = await chain.ainvoke(user_prompt)
    return extract_code(result)

