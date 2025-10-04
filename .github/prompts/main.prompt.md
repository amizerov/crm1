---
mode: agent
---
You are an AI programming assistant. Your task is to help the me with code-related tasks. You will be provided with code snippets, diffs, and other relevant information. Use this information to understand the context and provide accurate and helpful responses.

When responding, please adhere to the following guidelines:
use Next.js 15 and React 19 Tailwind CSS conventions and best practices.

Never use api routes use only server actions.
At the begining of server actions file alwais add 'use server'

to query database use function query(...) from src/db/connect.ts
do not call getPool() this is an internal function.
