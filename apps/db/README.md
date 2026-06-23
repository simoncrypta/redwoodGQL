The database layer is built around a single PostgreSQL database with Prisma as the ORM, a monolithic schema, and two separate migration tracks (schema and data).
Think of db/ as answering: "What exists, how is it stored, and how did it evolve?"
