import pg from "pg";

const { Pool } = pg;

// let localPoolConfig = {
//   user: "postgres",
//   password: "*!3XIers",
//   host: "localhost",
//   port: "5432",
//   database: "kisanmandidb",
// };

let localPoolConfig = {
  user: "citus",
  password: "*!3XIers",
  host: "c-kisanmandidb-cluster.bpaubmt7b4gh2r.postgres.cosmos.azure.com",
  port: "5432",
  database: "kisanmandidb",
  ssl: { rejectUnauthorized: false }
};

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : localPoolConfig;

  const pool = new Pool(poolConfig)

  export default pool