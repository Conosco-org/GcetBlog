import * as migration_20260928_175608_update_auth_provider_schema from './20260928_175608_update_auth_provider_schema';

export const migrations = [
  {
    up: migration_20260928_175608_update_auth_provider_schema.up,
    down: migration_20260928_175608_update_auth_provider_schema.down,
    name: '20260928_175608_update_auth_provider_schema'
  },
];
