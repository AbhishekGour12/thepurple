import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:ThePurpleOnline%40123@db.letzcjtlxpfpikpmbvai.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name, column_name, data_type, udt_name, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema='public' AND table_name IN ('admins', 'admin_sessions', 'admin_password_resets', 'audit_logs', 'bulk_imports', 'attributes', 'attribute_values', 'colors', 'sizes', 'product_variants', 'products')
    ORDER BY table_name, ordinal_position
  `);
  const tableCols = {};
  for (const r of res.rows) {
    tableCols[r.table_name] = tableCols[r.table_name] || [];
    tableCols[r.table_name].push(`${r.column_name} (${r.data_type} / ${r.udt_name}, nullable:${r.is_nullable})`);
  }
  console.log('TABLES:');
  console.log(JSON.stringify(tableCols, null, 2));

  // Enums
  const enums = await client.query(`
    SELECT t.typname as enum_name, e.enumlabel as enum_value
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    ORDER BY enum_name, e.enumsortorder;
  `);
  const enumMap = {};
  for (const r of enums.rows) {
    enumMap[r.enum_name] = enumMap[r.enum_name] || [];
    enumMap[r.enum_name].push(r.enum_value);
  }
  console.log('ENUMS:');
  console.log(JSON.stringify(enumMap, null, 2));

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
