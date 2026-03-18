const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const usersWithDept = await prisma.user.findMany({
        where: { deptId: { not: null } },
        select: { deptId: true }
    });
    
    const staffsWithDept = await prisma.staffProfile.findMany({
        select: { deptId: true }
    });
    
    const depts = new Set([...usersWithDept.map(u => u.deptId), ...staffsWithDept.map(s => s.deptId)]);
    console.log('Unique departments found:', Array.from(depts));
}

main().catch(console.error).finally(() => prisma.$disconnect());
