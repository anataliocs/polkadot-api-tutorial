# polkadot-api-tutorial

Barebones example of leveraging PAPI and the PAPI CLI.

----

## Config

Install dependencies:
```bash
bun install
```

Run Script:

```bash
bun run index.ts
```

----

## PAPI CLI

Register a new chain:
```
npx papi add --help
```

Adding Polkadot:
```
bunx papi add dot -n polkadot
```
- Creates `.papi` directory in root adds latest metadata for polkadot chain
- Adds npm dependency `@polkadot-api/descriptors": "file:.papi/descriptors`
- Creates a PAPI configuration file `polkadot-api.json` 

Adding other chains:
```
bunx papi add people -n polkadot_people
bunx papi add collectives -n polkadot_collectives
```

