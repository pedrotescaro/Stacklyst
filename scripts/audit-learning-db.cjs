// Read-only inventory: never print connection strings, user identities or source submissions.
require('dotenv').config({ path: '.env.local', quiet: true });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
(async () => {
  const queries = {
    content: `SELECT language, count(*)::int AS exercises, count(DISTINCT knowledge_node_id)::int AS nodes FROM exercises WHERE is_published GROUP BY language`,
    paths: `SELECT p.slug, count(n.id)::int AS nodes FROM learning_paths p LEFT JOIN learning_path_nodes n ON n.learning_path_id=p.id WHERE p.is_published GROUP BY p.slug ORDER BY p.slug`,
    duplicateCompletions: `SELECT count(*)::int AS groups FROM (SELECT user_id,exercise_id FROM exercise_submissions WHERE first_completion GROUP BY user_id,exercise_id HAVING count(*)>1) d`,
    progress: `SELECT (SELECT count(*)::int FROM user_node_progress) AS node_records, (SELECT count(*)::int FROM "QuizAttempt") AS attempts`,
    examples: `SELECT slug,title,function_name,language FROM exercises WHERE is_published ORDER BY language,slug`,
  };
  try { for (const [name, sql] of Object.entries(queries)) console.log(name, JSON.stringify((await pool.query(sql)).rows)); }
  finally { await pool.end(); }
})().catch(e => { console.error(e.code || e.name); process.exitCode=1; });
