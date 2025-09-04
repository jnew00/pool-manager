#!/usr/bin/env npx tsx

import { prisma } from '../src/lib/prisma';

async function clearSpreads() {
  try {
    const count = await prisma.line.count();
    console.log(`📊 Current spreads in database: ${count}`);
    
    const result = await prisma.line.deleteMany({});
    console.log(`🗑️  Deleted ${result.count} spreads from database`);
    
    const finalCount = await prisma.line.count();
    console.log(`📊 Remaining spreads: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Error clearing spreads:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSpreads();