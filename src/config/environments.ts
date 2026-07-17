export const environments = {
  staging: {
    name: 'staging',
    baseURL: 'https://wl.stg.simplenight.com',
    timeout: 30000,
  },
  production: {
    name: 'production',
    baseURL: 'https://www.simplenight.com',
    timeout: 30000,
  },
  local: {
    name: 'local',
    baseURL: 'http://localhost:3000',
    timeout: 10000,
  },
};

export type Environment = keyof typeof environments;

export function getEnvironment(): typeof environments.staging {
  const env = (process.env.TEST_ENV as Environment) || 'staging';
  return environments[env] || environments.staging;
}
