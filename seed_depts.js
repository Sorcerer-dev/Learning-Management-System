const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const depts = [
        { id: 'CSE', name: 'Computer Science and Engineering' },
        { id: 'EEE', name: 'Electrical and Electronics Engineering' },
        { id: 'ECE', name: 'Electronics and Communication Engineering' },
        { id: 'MECH', name: 'Mechanical Engineering' },
        { id: 'IT', name: 'Information Technology' },
        { id: 'ADMIN', name: 'Administration' }
    ];

    for (const d of depts) {
        await prisma.department.upsert({
            where: { id: d.id },
            update: { name: d.name },
            create: d
        });
    }
    console.log('Departments seeded successfully');
}

main().catch(console.error).finally(() => prisma.$disconnect());
