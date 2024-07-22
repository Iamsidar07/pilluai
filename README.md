# Installation

Install langchain

```bash
npm i langchain
```

Optionally
Most of the RAG(Retrieval Augmented Generation) application required multiple steps for LLM(Large Language Model) calls.
It's like logging use LangSmith. To use LangSmith, you need to do the following steps:
Add these two env variables to your .env file. Get your api key by signup at [LangSmith](https://smith.langchain.com/)

```env
LANGCHAIN_TRACING_V2="true"
LANGCHAIN_API_KEY="..."
```
