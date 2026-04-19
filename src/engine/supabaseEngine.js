// MaterialFlow AI — Supabase Integration Engine
// Handles project initialization, schema management, and auth setup

const SUPABASE_API = 'https://api.supabase.com/v1';

/**
 * Create a new Supabase project (requires Supabase Management API key)
 */
export async function createSupabaseProject(token, name, region = 'us-east-1', dbPassword) {
  const orgRes = await fetch(`${SUPABASE_API}/organizations`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const orgs = await orgRes.json();
  const orgId = orgs?.[0]?.id;
  if (!orgId) throw new Error('No Supabase organization found');

  const res = await fetch(`${SUPABASE_API}/projects`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      organization_id: orgId,
      region,
      db_pass: dbPassword || generatePassword(),
      plan: 'free',
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create Supabase project');
  }

  return res.json();
}

/**
 * Generate Supabase client code for a project
 */
export function generateSupabaseSetup(supabaseUrl, anonKey) {
  return {
    'src/lib/supabase.ts': `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = '${supabaseUrl}';
const supabaseAnonKey = '${anonKey}';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
`,
    'src/hooks/useAuth.ts': `import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signIn, signUp, signOut };
}
`,
    'src/hooks/useData.ts': `import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useData(table) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows, error: err } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setData(rows || []);
    setLoading(false);
  }, [table]);

  useEffect(() => { fetch(); }, [fetch]);

  const insert = async (row) => {
    const { error: err } = await supabase.from(table).insert(row);
    if (err) throw err;
    await fetch();
  };

  const update = async (id, updates) => {
    const { error: err } = await supabase.from(table).update(updates).eq('id', id);
    if (err) throw err;
    await fetch();
  };

  const remove = async (id) => {
    const { error: err } = await supabase.from(table).delete().eq('id', id);
    if (err) throw err;
    await fetch();
  };

  return { data, loading, error, refetch: fetch, insert, update, remove };
}
`,
  };
}

/**
 * Generate SQL migration for common table patterns
 */
export function generateMigration(schema) {
  const tables = schema.tables || [];
  let sql = '-- MaterialFlow AI Generated Migration\n\n';

  for (const table of tables) {
    sql += `CREATE TABLE IF NOT EXISTS ${table.name} (\n`;
    const cols = table.columns || [];
    const colDefs = cols.map(col => {
      let def = `  ${col.name} ${col.type}`;
      if (col.primaryKey) def += ' PRIMARY KEY';
      if (col.default) def += ` DEFAULT ${col.default}`;
      if (col.notNull) def += ' NOT NULL';
      return def;
    });
    sql += colDefs.join(',\n');
    sql += '\n);\n\n';

    // Add RLS
    sql += `ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;\n\n`;

    // Basic RLS policy
    if (table.enableAuth) {
      sql += `CREATE POLICY "Users can view own data" ON ${table.name}\n`;
      sql += `  FOR SELECT USING (auth.uid() = user_id);\n\n`;
      sql += `CREATE POLICY "Users can insert own data" ON ${table.name}\n`;
      sql += `  FOR INSERT WITH CHECK (auth.uid() = user_id);\n\n`;
    }
  }

  return sql;
}

/**
 * Common schema templates
 */
export const SCHEMA_TEMPLATES = {
  users: {
    name: 'profiles',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'UUID', notNull: true, default: 'auth.uid()' },
      { name: 'email', type: 'TEXT' },
      { name: 'full_name', type: 'TEXT' },
      { name: 'avatar_url', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'now()', notNull: true },
    ],
    enableAuth: true,
  },
  posts: {
    name: 'posts',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'UUID', notNull: true, default: 'auth.uid()' },
      { name: 'title', type: 'TEXT', notNull: true },
      { name: 'content', type: 'TEXT' },
      { name: 'published', type: 'BOOLEAN', default: 'false' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'now()', notNull: true },
    ],
    enableAuth: true,
  },
  todos: {
    name: 'todos',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'UUID', notNull: true, default: 'auth.uid()' },
      { name: 'title', type: 'TEXT', notNull: true },
      { name: 'completed', type: 'BOOLEAN', default: 'false' },
      { name: 'due_date', type: 'DATE' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'now()', notNull: true },
    ],
    enableAuth: true,
  },
};

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let pass = '';
  for (let i = 0; i < 20; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}
