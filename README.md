This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## AI-assisted dictionary updates

Use the bundled helper to translate new dictionary entries into every language in `Dictionary/` with a single command.

### 1. Configure your API key

Set an [OpenAI](https://platform.openai.com/) API key once in your shell profile:

```bash
export OPENAI_API_KEY="sk-..."
```

Optionally pin a different model:

```bash
export OPENAI_MODEL="gpt-4o-mini"
```

### 2. Generate translations

Fire up the helper and let the guided UI collect everything it needs:

```bash
npm run i18n:add
```

You’ll see a friendly prompt flow where you can choose between a single key or a JSON batch file, enter the English copy, pick languages, and toggle options like dry-run/overwrite/placeholder safety. The terminal banner and summaries keep things readable even for longer sessions.

Prefer to automate or script the process? All previous flags still work. Provide whatever you need on the command line and the prompt flow will be skipped automatically:

```bash
npm run i18n:add -- --key profile.gettingStarted.startTutorial --text "Start tutorial" --context "CTA on the profile onboarding card" --languages en,fr,de --dry-run
```

Available flags:

-   `--languages` (optional) limits the update to a comma-separated subset; all known languages are used by default.
-   `--context` (optional) supplies extra detail for higher-quality translations.
-   `--dry-run` previews the diff without touching files.
-   `--overwrite` replaces an existing value rather than skipping it.
-   `--model` overrides the default model for a single run.
-   `--strict-placeholders` refuses to write translations when placeholder counts don’t line up with the English source.
-   `--input <file>` loads a batch of items from JSON (see below).

### 3. Review changes

Every run ends with a formatted report that includes:

-   A table showing the key, language, status, and whether it was a real write or a dry-run.
-   Aggregated stats (updates, skips, placeholder mismatches, errors) and the elapsed time.

### Batch mode

Hand the CLI a JSON file to translate several keys at once:

```jsonc
// batch.json
[
	{
		"key": "profile.onboarding.start",
		"text": "Start tutorial",
		"context": "CTA on the profile onboarding card",
		"languages": ["en", "fr", "de"]
	},
	{
		"key": "chat.placeholder",
		"text": "Type your message..."
	}
]
```

```bash
npm run i18n:add -- --input batch.json --dry-run
```

Each entry may specify its own languages override; otherwise the CLI defaults (or the full Dictionary list) are used.

### Placeholder safety net

The helper automatically compares placeholder tokens like `{amount}` or `{name}` between the English source and every translation. With `--strict-placeholders` it will skip writing mismatched rows; without it, the row still lands but the summary highlights the discrepancy so you can follow up manually.

### To update the locale key value

```bash
node scripts/Dictionary/updateTranslation.mjs "key.path" "New English Value"
```

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) – learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) – an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) – your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
