#!/bin/bash

# Script to verify production database has all required tables and columns

echo "🔍 Verifying production database schema..."
echo ""

# Check if key tables exist
echo "📊 Checking for required tables..."
psql $DATABASE_URL -t -c "
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pool_completions')
        THEN '✅ pool_completions table exists'
        ELSE '❌ pool_completions table MISSING'
    END as pool_completions,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_ratings')
        THEN '✅ team_ratings table exists'
        ELSE '❌ team_ratings table MISSING'
    END as team_ratings;
"

echo ""
echo "📋 Checking pools table columns..."
psql $DATABASE_URL -t -c "
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pools' AND column_name = 'season')
        THEN '✅ pools.season exists'
        ELSE '❌ pools.season MISSING'
    END as season,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pools' AND column_name = 'buyIn')
        THEN '✅ pools.buyIn exists'
        ELSE '❌ pools.buyIn MISSING'
    END as buyIn,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pools' AND column_name = 'url')
        THEN '✅ pools.url exists'
        ELSE '❌ pools.url MISSING'
    END as url;
"

echo ""
echo "🎯 Checking for PENDING enum value..."
psql $DATABASE_URL -t -c "
SELECT 
    CASE 
        WHEN 'PENDING' = ANY(enum_range(NULL::\"PickOutcome\"))
        THEN '✅ PENDING exists in PickOutcome enum'
        ELSE '❌ PENDING MISSING from PickOutcome enum'
    END as pending_status;
"

echo ""
echo "📈 Checking migration status..."
npx prisma migrate status

echo ""
echo "🔄 Attempting to deploy any remaining migrations..."
npx prisma migrate deploy

echo ""
echo "✨ Final verification complete!"