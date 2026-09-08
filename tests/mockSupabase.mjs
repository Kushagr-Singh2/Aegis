// tests/mockSupabase.mjs
// Lightweight in-memory mock for @supabase/supabase-js during offline sandbox testing.

export function createClient() {
  const queryBuilder = {
    select: () => queryBuilder,
    insert: () => queryBuilder,
    update: () => queryBuilder,
    delete: () => queryBuilder,
    eq: () => queryBuilder,
    in: () => queryBuilder,
    lt: () => queryBuilder,
    order: () => queryBuilder,
    limit: () => queryBuilder,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    then: (resolve) => resolve({ data: [], error: null }),
  };

  return {
    auth: {
      signUp: async () => ({ data: { user: { id: 'mock-user' } }, error: null }),
      signInWithPassword: async () => ({ data: { user: { id: 'mock-user' }, session: {} }, error: null }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: { id: 'mock-user' } }, error: null }),
      refreshSession: async () => ({ data: { session: null, user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => queryBuilder,
    channel: () => ({
      on: function () {
        return this;
      },
      subscribe: function () {
        return this;
      },
    }),
    removeChannel: () => {},
  };
}
