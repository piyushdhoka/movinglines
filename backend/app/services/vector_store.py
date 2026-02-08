import os
import logging
from pinecone import Pinecone
from langchain_google_genai import GoogleGenerativeAIEmbeddings

logger = logging.getLogger(__name__)

pc = None
index = None

def get_pinecone_index():
    global pc, index
    if pc is None:
        api_key = os.getenv("PINECONE_API_KEY")
        index_name = os.getenv("PINECONE_INDEX", "manim-examples")
        if not api_key:
            logger.warning("[Pinecone] PINECONE_API_KEY not set. RAG context will be skipped.")
            return None
        logger.info(f"[Pinecone] Connecting to index: {index_name}")
        try:
            pc = Pinecone(api_key=api_key)
            index = pc.Index(index_name)
        except Exception as e:
            logger.error(f"[Pinecone] Failed to connect to index '{index_name}': {e}")
            return None
    return index

def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

async def get_relevant_examples(query: str, top_k: int = 5) -> list[dict]:
    """
    Retrieve relevant Manim code examples from Pinecone.
    Returns list of dicts with 'code' and 'description' keys.
    """
    try:
        embeddings = get_embeddings()
        query_embedding = embeddings.embed_query(query)
        
        idx = get_pinecone_index()
        if idx is None:
            logger.info("[Pinecone] No index available. Returning empty examples.")
            return []
        results = idx.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        examples = []
        for match in results.matches:
            if match.metadata:
                example = {
                    "code": match.metadata.get("code", ""),
                    "description": match.metadata.get("description", ""),
                    "score": match.score,
                    "source": match.metadata.get("source", "unknown")
                }
                if example["code"]:
                    examples.append(example)
                    logger.info(f"[Pinecone] Found match (score={match.score:.3f}): {example['description'][:50]}...")
        
        logger.info(f"[Pinecone] Retrieved {len(examples)} relevant examples for query: {query[:50]}...")
        if examples:
            logger.info(f"[Pinecone] Top example desc: {examples[0]['description'][:80]}...")
        return examples
        
    except Exception as e:
        logger.error(f"[Pinecone] Query error: {e}")
        return []


def format_examples_for_context(examples: list[dict]) -> str:
    """Format retrieved examples into a context string for the LLM."""
    if not examples:
        return "No specific examples found. Use the patterns from the system prompt."
    
    context_parts = []
    for i, ex in enumerate(examples, 1):
        context_parts.append(f"""
### Retrieved Example {i} (Relevance: {ex.get('score', 0):.2f}) ###
Description: {ex['description'][:300]}

```python
{ex['code']}
```
""")
    
    return "\n".join(context_parts)


async def upsert_example(id: str, description: str, code: str):
    """Add a single example to Pinecone."""
    embeddings = get_embeddings()
    vector = embeddings.embed_query(f"{description}\n\nCode:\n{code[:500]}")
    
    idx = get_pinecone_index()
    idx.upsert(vectors=[{
        "id": id,
        "values": vector,
        "metadata": {"description": description, "code": code}
    }])
    logger.info(f"[Pinecone] Upserted example: {id}")

