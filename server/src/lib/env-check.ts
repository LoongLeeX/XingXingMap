// 环境变量诊断工具
export function checkDatabaseEnv() {
  const databaseUrl = process.env.DATABASE_URL;
  console.log('🔍 [ENV] DATABASE_URL:', databaseUrl);
  console.log('🔍 [ENV] process.env keys:', Object.keys(process.env).filter(k => k.includes('DATABASE')));
  return databaseUrl;
}

