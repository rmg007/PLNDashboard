@echo off
echo Adding environment variables to Vercel...

call npx vercel env add POSTGRES_URL production
echo postgres://postgres.fnhpgrkegpqdssggknfa:US9QnL3xBvc05gHT@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require^&supa=base-pooler.x

call npx vercel env add POSTGRES_USER production
echo postgres

call npx vercel env add POSTGRES_HOST production
echo db.fnhpgrkegpqdssggknfa.supabase.co

call npx vercel env add SUPABASE_JWT_SECRET production
echo QT8MTgfVbSrW+2Qs74kbGfoJpbpyOhxYVNITqT4yjWNC/KTNZ8474Fz7tv3k905kYJy8EpDV2F/En5CE9MwVxA==

call npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuaHBncmtlZ3BxZHNzZ2drbmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzAwNzgsImV4cCI6MjA2NzAwNjA3OH0.0S5mzBVOlprrnoa5oTxo9_7yZd2bHH2KDlT5T9xWKzg

call npx vercel env add POSTGRES_PRISMA_URL production
echo postgres://postgres.fnhpgrkegpqdssggknfa:US9QnL3xBvc05gHT@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require^&pgbouncer=true

call npx vercel env add POSTGRES_PASSWORD production
echo US9QnL3xBvc05gHT

call npx vercel env add POSTGRES_DATABASE production
echo postgres

call npx vercel env add SUPABASE_URL production
echo https://fnhpgrkegpqdssggknfa.supabase.co

call npx vercel env add SUPABASE_ANON_KEY production
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuaHBncmtlZ3BxZHNzZ2drbmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzAwNzgsImV4cCI6MjA2NzAwNjA3OH0.0S5mzBVOlprrnoa5oTxo9_7yZd2bHH2KDlT5T9xWKzg

call npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo https://fnhpgrkegpqdssggknfa.supabase.co

call npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuaHBncmtlZ3BxZHNzZ2drbmZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDA3OCwiZXhwIjoyMDY3MDA2MDc4fQ.bMiwBb3184ojiRKbvWnC0B4AJuMk0lEoI1o0-Q2gHwE

call npx vercel env add POSTGRES_URL_NON_POOLING production
echo postgres://postgres.fnhpgrkegpqdssggknfa:US9QnL3xBvc05gHT@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require

echo Done! Environment variables have been added to Vercel. 