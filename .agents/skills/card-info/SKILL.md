---
name: card-info
description: >-
  Retrieve card catalog information (name, abilities, cost, BP, species, etc.) by card ID or name.
  Use when you need to inspect card details while implementing or migrating card effects.
---

# Card Info Lookup

Retrieve card catalog information from `src/submodule/suit/catalog/catalog.json`.

## Usage

Run the following command with Bun:

```sh
bun .agents/skills/card-info/scripts/get-card.ts <card-id-or-name>
```

### Examples

```sh
bun .agents/skills/card-info/scripts/get-card.ts 2-3-019
bun .agents/skills/card-info/scripts/get-card.ts 牙将クロコダイル
```
