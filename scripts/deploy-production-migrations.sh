#!/bin/bash

# Deploy migrations to production database
# This script should be run after setting the DATABASE_URL environment variable to your production database

echo "🚀 Deploying migrations to production database..."
echo "⚠️  Make sure DATABASE_URL is set to your production database!"
echo ""
read -p "Continue with deployment? (y/N): " confirm

if [[ $confirm != [yY] ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo "📋 Checking migration status..."
npx prisma migrate status

echo ""
echo "🔄 Deploying migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migrations deployed successfully!"
    echo ""
    echo "📊 Current migration status:"
    npx prisma migrate status
else
    echo "❌ Migration deployment failed. Please check the errors above."
    exit 1
fi

echo ""
echo "🎯 Production database is now in sync with development!"