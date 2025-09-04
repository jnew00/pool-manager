#!/usr/bin/env npx tsx

import { prisma } from '../src/lib/prisma';

async function cleanupDuplicateLines() {
  console.log('🧹 Cleaning up duplicate lines...\n');

  try {
    // Find all duplicate groups (same gameId, poolId, source)
    const duplicateGroups = await prisma.$queryRaw<Array<{
      gameId: string;
      poolId: string | null;
      source: string;
      count: bigint;
    }>>`
      SELECT "gameId", "poolId", source, COUNT(*) as count
      FROM lines 
      GROUP BY "gameId", "poolId", source
      HAVING COUNT(*) > 1
    `;

    console.log(`📊 Found ${duplicateGroups.length} groups with duplicates:`);
    
    let totalDuplicatesRemoved = 0;

    for (const group of duplicateGroups) {
      const count = Number(group.count);
      console.log(`   - Game ${group.gameId}, Pool ${group.poolId}, Source "${group.source}": ${count} lines`);
      
      // Get all lines for this group, ordered by capturedAt DESC (newest first)
      const linesInGroup = await prisma.line.findMany({
        where: {
          gameId: group.gameId,
          poolId: group.poolId,
          source: group.source,
        },
        orderBy: {
          capturedAt: 'desc'
        }
      });

      // Keep the first (newest) line, delete the rest
      if (linesInGroup.length > 1) {
        const linesToDelete = linesInGroup.slice(1); // All except the first (newest)
        
        for (const line of linesToDelete) {
          await prisma.line.delete({
            where: { id: line.id }
          });
          totalDuplicatesRemoved++;
        }
        
        console.log(`     → Kept newest line (${linesInGroup[0].id}), removed ${linesToDelete.length} duplicates`);
      }
    }

    console.log(`\n✅ Cleanup complete! Removed ${totalDuplicatesRemoved} duplicate lines.`);
    
    // Show final count
    const finalCount = await prisma.line.count();
    console.log(`📊 Total lines remaining: ${finalCount}`);

    // Show breakdown by source
    const breakdown = await prisma.line.groupBy({
      by: ['source'],
      _count: { source: true },
    });

    console.log('\n📋 Lines by source:');
    breakdown.forEach((item) => {
      console.log(`   - ${item.source}: ${item._count.source} lines`);
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateLines();