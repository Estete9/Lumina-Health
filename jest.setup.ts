import '@testing-library/jest-dom';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_CLINICAL_NOTES } from './lib/services/mockData';

let patientsDb: any[] = JSON.parse(JSON.stringify(MOCK_PATIENTS));
let appointmentsDb: any[] = JSON.parse(JSON.stringify(MOCK_APPOINTMENTS));
let notesDb: any[] = JSON.parse(JSON.stringify(MOCK_CLINICAL_NOTES));

function getTable(name: string): any[] {
  if (name === 'patients') return patientsDb;
  if (name === 'appointments') return appointmentsDb;
  if (name === 'clinical_notes') return notesDb;
  return [];
}

export function createMockSupabase() {
  return {
    from: (tableName: string) => {
      let data = [...getTable(tableName)];
      let isSingle = false;
      let lastInsertedOrUpdated: any = null;

      const queryBuilder: any = {
        select: (columns = '*') => queryBuilder,
        eq: (field: string, val: any) => {
          data = data.filter((item: any) => item[field] === val);
          return queryBuilder;
        },
        order: (field: string, opts?: { ascending?: boolean }) => {
          const asc = opts?.ascending !== false;
          data = [...data].sort((a: any, b: any) => {
            if (a[field] < b[field]) return asc ? -1 : 1;
            if (a[field] > b[field]) return asc ? 1 : -1;
            return 0;
          });
          return queryBuilder;
        },
        single: () => {
          isSingle = true;
          return queryBuilder;
        },
        insert: (input: any) => {
          const records = Array.isArray(input) ? input : [input];
          const createdRecords = records.map((r) => {
            const newItem = {
              id: r.id || `${tableName.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...r,
            };
            getTable(tableName).push(newItem);
            return newItem;
          });
          lastInsertedOrUpdated = Array.isArray(input) ? createdRecords : createdRecords[0];
          data = createdRecords;
          return queryBuilder;
        },
        update: (input: any) => {
          lastInsertedOrUpdated = input;
          return {
            eq: (field: string, val: any) => {
              const table = getTable(tableName);
              let updatedItem: any = null;
              table.forEach((item: any) => {
                if (item[field] === val) {
                  Object.assign(item, input, { updated_at: new Date().toISOString() });
                  updatedItem = item;
                }
              });
              data = updatedItem ? [updatedItem] : [];
              lastInsertedOrUpdated = updatedItem;
              return queryBuilder;
            },
            select: () => queryBuilder,
            single: () => {
              isSingle = true;
              return queryBuilder;
            }
          };
        },
        delete: () => {
          return {
            eq: (field: string, val: any) => {
              const table = getTable(tableName);
              const idx = table.findIndex((item: any) => item[field] === val);
              if (idx !== -1) {
                table.splice(idx, 1);
              }
              return Promise.resolve({ data: null, error: null });
            }
          };
        },
        then: (resolve: any, reject: any) => {
          const result = isSingle
            ? {
                data: data.length > 0 ? data[0] : (lastInsertedOrUpdated || null),
                error: data.length === 0 && !lastInsertedOrUpdated ? { message: `${tableName === 'patients' ? 'Patient' : 'Record'} not found` } : null
              }
            : { data: data, error: null };
          return Promise.resolve(result).then(resolve, reject);
        }
      };
      return queryBuilder;
    },
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'prac-1', email: 'sarah.jenkins@lumina.local' } },
        error: null
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'prac-1', email: 'sarah.jenkins@lumina.local' }, access_token: 'mock-jwt-token' } },
        error: null
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: 'prac-1', email: 'sarah.jenkins@lumina.local' }, session: { access_token: 'mock-jwt-token' } },
        error: null
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: { id: 'prac-1', email: 'newdoc@lumina.local' }, session: { access_token: 'mock-jwt-token' } },
        error: null
      }),
      signOut: jest.fn().mockResolvedValue({ error: null })
    }
  };
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => createMockSupabase())
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => createMockSupabase())
}));
