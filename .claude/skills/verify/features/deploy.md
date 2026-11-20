# Deploy

Production on Vercel (team xaxis-projects, project phosphoros) at phosphoros.space, proven live after every deploy.

<!-- covers: cli:deploy -->

## Sub-features

- project: creates the Vercel project if missing and applies its settings (root `web`, Node 24, files outside the root allowed).
- domains: adds `phosphoros.space` and `www.phosphoros.space` (308 to the apex).
- deploy: uploads `git archive HEAD` (never the working tree) with `PHOSPHOROS_BUILD=<sha>`.
- prove: the live page carries this commit's `phosphoros-build` meta and the security headers (nosniff, Referrer-Policy, X-Frame-Options DENY, CSP); assets answer with their types; every sitemap page answers 200; a missing page is 404; www redirects.
- dns: for a domain whose DNS does not point at Vercel yet, prints the A and CNAME records it needs.

## How to reach it

- `tools/deploy.sh` (deploy HEAD), `tools/deploy.sh --check` (prove the live site serves HEAD), `tools/deploy.sh --check SHA`.

## How to check it

Static: `bash -n tools/deploy.sh`.

Runtime:

```sh
tools/deploy.sh --check; echo "exit $?"
```

Proves it when: it ends `site ok: <sha> is live at ...` and exits 0, and prints any DNS records still missing.

## Gotchas

- Needs `VERCEL_TOKEN` in `.env` (gitignored, mode 600). The token goes to curl through a config file and to the CLI through a temporary global config, never on a command line.
- Commit first: uncommitted changes are not deployed.
- The commit author must be `Xaxis <william.neeley@gmail.com>`, or Vercel's seat check blocks the deploy silently.
