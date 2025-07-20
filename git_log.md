# Git Log Archive

This file contains the git history from the nested `landing/` repository before removing the `.git` directory to fix Coolify deployment issues.

## Repository Information
- **Remote Origin**: https://github.com/frankdierolf/presentai.git
- **Date Archived**: 2025-07-20
- **Reason**: Removing nested git repository to resolve Coolify deployment error

## Git Log (--oneline --all --graph)

```
* d43d6df :zap: (pocketbase) add pocketbase backend
* 2372c68 :zap: (landing) add landing page and enhance thruh working billing
* 807e8f2 feat: replace outdated workflows with new OpenAI integration for file summarization
*   a1f15ae Merge branch 'main' of https://github.com/frankdierolf/presentai
|\  
| * bdeaf06 feat: Add voice command support for real-time presentations
| * 8797390 silent tool use
| * e349c46 feat: integrate OpenAI Realtime API with slide navigation
| * 9daca7b ✨ (frontend) add Slidev-based presentation framework
| * 05bf81c :zap: (backend) init hono api
* | ef1aa1a feat: initialize upload-file project with React, Vite, and TypeScript
|/  
* 6b6b2f0 edit readme
* fd5957e add 'julien' to README.md
* bbb920b yes
* 1407181 :zap: (./REAMDE.md) init
```

## Note
The landing directory history is identical to the main repository history, indicating this was the same repository with a nested `.git` directory causing submodule conflicts during deployment.