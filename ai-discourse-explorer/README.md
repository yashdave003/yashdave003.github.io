# AI Discourse Corpus — public preview (Overview / Events / Timeline)

Static, backend-free slice of the AI Discourse Corpus Explorer. Only the three
aggregate layers are published here:

- **Overview** — corpus-scope dashboard (counts + streamgraph), read from `overview.json`.
- **Events** — the clustered event spine (`event_clusters.json`).
- **Timeline** — the cross-layer event firehose (`events.json`).

The full corpus (document, tweet, HN, and benchmark-census rows) is NOT included.
The benchmark `access` bands shown on the Overview are **provisional (pre-validation)**.

## Regenerate
From `ai-discourse/ai-comms/`:

    python scripts/build_share_explorer.py --out <this folder>

This re-exports the JSON from `corpus.db` and copies `explorer/share_index.html`
to `index.html`. Source of truth lives in the ai-discourse repo; this folder is a
publish target.

## Serve locally
    python -m http.server 8080
Open http://localhost:8080  (fetch() needs HTTP, not file://).
