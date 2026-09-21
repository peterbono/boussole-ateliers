# Example content schema (content/ex-A.json … ex-D.json)

{
  "<workshop id>": {
    "en": {
      "context": "One sentence: which moment of Fieldnote's story this example shows (stage, who is in the room).",
      "blocks": [ {"t": "<label exactly as in layouts.en.js>", "items": ["sticky 1", "sticky 2", "..."]}, ... ],
      "takeaway": "One or two sentences: what the team decided or learned from this filled board."
    },
    "fr": { same, labels exactly as in layouts.fr.js, items in French }
  }
}

Block labels must match the layout of the workshop (see layouts.en.js / layouts.fr.js):
- columns  → one block per column t
- quadrant → one block per cell (the 4 cells, in order top-left, top-right, bottom-left, bottom-right), plus footer blocks if any
- canvas   → one block per block t
- grid     → one block per ROW label (items = one entry per column, prefixed with the column label like "Q1: …"); if rows are empty labels, use the column labels as blocks
- tree     → one block per level t (items = the nodes at that level, "Actor 1 → Impact" style arrows allowed)
- flow     → one block per step (items = 1 to 3 notes for that step); the branch, if any, is a block named like the branch label

Items: 2 to 6 per block, sticky-note style, 3 to 12 words. Use the Fieldnote facts. No em-dash.
