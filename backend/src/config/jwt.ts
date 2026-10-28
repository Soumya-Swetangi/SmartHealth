export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'smart_health_northeast_sih2025_jwt_secret_token_key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'smart_health_northeast_sih2025_refresh_token_key',
  accessExpire: process.env.JWT_EXPIRE || '2h',
  refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d'
};
