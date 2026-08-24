# Rethinksoft

A server-rendered operating system for software entrepreneurs. Rethinksoft helps founders discover opportunities, validate markets, define products, launch, find customers, and decide what to do next.

## Local development

```sh
npm install
npm run dev
```

The SQLite database is created automatically at `data/site.db`. Set `DATABASE_PATH` to change its location and `SITE_URL` to set canonical URLs.

## Content

Every product blueprint is a standalone JSON file in `data/apps/`. Researched business opportunities live in `src/lib/opportunities.ts`. Founder profiles, Rethink Scores, and weekly goals are stored in SQLite for the P0 validation experience.

## Production

```sh
npm run build
node ./dist/server/entry.mjs
```

Use a persistent disk for the SQLite database. Reverse-proxy the Node server and set `SITE_URL` to the public origin.

## Privacy

No ads, payments, or third-party analytics. Private Founder OS workspaces use an HttpOnly browser cookie, and no public profile is created during onboarding. Vote IPs are salted and irreversibly hashed. Waitlist emails are deduplicated.

## License

MIT
