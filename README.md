![description](./assets/banner.png)

[![NPM Version](https://img.shields.io/npm/v/kysely-turso?style=flat&label=latest)](https://github.com/kysely-org/kysely-turso/releases/latest)
[![Tests](https://github.com/kysely-org/kysely-turso/actions/workflows/test.yml/badge.svg)](https://github.com/kysely-org/kysely-turso)
[![License](https://img.shields.io/github/license/kysely-org/kysely-turso?style=flat)](https://github.com/kysely-org/kysely-turso/blob/main/LICENSE)
[![Issues](https://img.shields.io/github/issues-closed/kysely-org/kysely-turso?logo=github)](https://github.com/kysely-org/kysely-turso/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)
[![Pull Requests](https://img.shields.io/github/issues-pr-closed/kysely-org/kysely-turso?label=PRs&logo=github&style=flat)](https://github.com/kysely-org/kysely-turso/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc)
![GitHub contributors](https://img.shields.io/github/contributors/kysely-org/kysely-turso)
[![Downloads](https://img.shields.io/npm/dw/kysely-turso?logo=npm)](https://www.npmjs.com/package/kysely-turso)

###### Join the discussion ⠀⠀⠀⠀⠀⠀⠀

[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=flat&logo=discord&logoColor=white)](https://discord.gg/xyBJ3GwvAm)
[![Bluesky](https://img.shields.io/badge/Bluesky-0285FF?style=flat&logo=Bluesky&logoColor=white)](https://bsky.app/profile/kysely.dev)


`kysely-turso` offers [Kysely](https://kysely.dev) dialects for [Turso](https://turso.tech)'s [serverless driver](https://www.npmjs.com/package/@tursodatabase/serverless) and [LibSQL client](https://www.npmjs.com/package/@libsql/client).

## Installation

### Node.js

```bash
npm install kysely-turso @tursodatabase/serverless kysely
```

```bash
pnpm add kysely-turso @tursodatabase/serverless kysely
```

```bash
yarn add kysely-turso @tursodatabase/serverless kysely
```

### Other runtimes

```bash
deno add npm:kysely-turso npm:@tursodatabase/serverless npm:kysely
```

```bash
bun add kysely-turso @tursodatabase/serverless kysely
```

## Usage

### @tursodatabase/serverless

Interactive transactions are not supported as of `@tursodatabase/serveress@0.1.3`.

```ts
import { connect } from '@tursodatabase/serverless'
import { type GeneratedAlways, Kysely } from 'kysely'
import { TursoServerlessDialect } from 'kysely-turso/serverless'

interface Database {
	person: {
		id: GeneratedAlways<number>;
		first_name: string | null;
		last_name: string | null;
		age: number;
	};
}

const db = new Kysely<Dataabase>({
  dialect: new TursoServerlessDialect({
    connection: connect({ 
      authToken: process.env.TURSO_AUTH_TOKEN!,
      url: process.env.TURSO_URL!,
    }),
  }),
})

const people = await db.selectFrom("person").selectAll().execute();
```

### @tursodatabase/serverless/compat

Signatures are defined, but nothing works as of `@tursodatabase/serveress@0.1.3`.

```ts
import { createClient } from '@tursodatabase/serverless/compat'
import { type GeneratedAlways, Kysely } from 'kysely'
import { LibSQLialect } from 'kysely-turso/libsql'

interface Database {
	person: {
		id: GeneratedAlways<number>;
		first_name: string | null;
		last_name: string | null;
		age: number;
	};
}

const db = new Kysely<Dataabase>({
  dialect: new LibSQLDialect({
    client: createClient({ url: process.env.TURSO_URL! }),
  }),
})

const people = await db.selectFrom("person").selectAll().execute();
```

### @libsql/client

```ts
import { createClient } from '@libsql/client'
import { type GeneratedAlways, Kysely } from 'kysely'
import { LibSQLialect } from 'kysely-turso/libsql'

interface Database {
	person: {
		id: GeneratedAlways<number>;
		first_name: string | null;
		last_name: string | null;
		age: number;
	};
}

const db = new Kysely<Dataabase>({
  dialect: new LibSQLDialect({
    client: createClient({ url: process.env.TURSO_URL! }),
  }),
})

const people = await db.selectFrom("person").selectAll().execute();
```

## Contribution

### Prerequisites

1. [Turso CLI](https://docs.turso.tech/cli/installation)

## Acknowledgements

[honzasp](https://github.com/honzasp) and [penberg](https://github.com/penberg) for creating and maintaining [`@libsql/kysely-libsql`](https://github.com/tursodatabase/kysely-libsql).

[ottomated](https://github.com/ottomated) for maintaining the [`kysely-libsql`](https://github.com/ottomated/kysely-libsql) fork. ❤️