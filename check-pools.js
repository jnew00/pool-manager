import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPools() {
  try {
    // Check all pools
    const allPools = await prisma.pool.findMany({
      select: {
        id: true,
        name: true,
        type: true,
      },
    })
    console.log('All pools:', allPools)

    // Check survivor pools specifically
    const survivorPools = await prisma.pool.findMany({
      where: { type: 'SURVIVOR' },
      include: {
        survivorEntries: true,
      },
    })
    console.log('Survivor pools:', survivorPools)

    if (survivorPools.length > 0) {
      console.log('First survivor pool ID:', survivorPools[0].id)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPools()
