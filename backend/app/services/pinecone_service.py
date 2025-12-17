import os
from pinecone import Pinecone
from langchain_google_genai import GoogleGenerativeAIEmbeddings

pc = None
index = None

def get_pinecone_index():
    global pc, index
    if pc is None:
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        index = pc.Index(os.getenv("PINECONE_INDEX", "manim-examples"))
    return index

def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

async def get_relevant_examples(query: str, top_k: int = 3) -> list[str]:
    try:
        embeddings = get_embeddings()
        query_embedding = embeddings.embed_query(query)
        
        idx = get_pinecone_index()
        results = idx.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        examples = []
        for match in results.matches:
            if match.metadata and "code" in match.metadata:
                examples.append(match.metadata["code"])
        
        return examples
    except Exception as e:
        print(f"Pinecone query error: {e}")
        return []

async def upsert_example(id: str, description: str, code: str):
    embeddings = get_embeddings()
    vector = embeddings.embed_query(description)
    
    idx = get_pinecone_index()
    idx.upsert(vectors=[{
        "id": id,
        "values": vector,
        "metadata": {"description": description, "code": code}
    }])

