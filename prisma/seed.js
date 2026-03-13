require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Root HR Admin User
    const hashedPassword = await bcrypt.hash('Admin123', 10);

    const hrUser = await prisma.user.upsert({
        where: { email: 'hr@univ.com' },
        update: {},
        create: {
            email: 'hr@univ.com',
            password: hashedPassword,
            userType: 'Admin',
            tagAccess: 'HR',
            status: 'Active',
        },
    });
    console.log('✅ Root HR Admin created:', hrUser.email);

    // 2. Create a Principal/Dean Admin User
    const principalUser = await prisma.user.upsert({
        where: { email: 'principal@univ.com' },
        update: {},
        create: {
            email: 'principal@univ.com',
            password: hashedPassword,
            userType: 'Admin',
            tagAccess: 'Dean',
            status: 'Active',
        },
    });
    console.log('✅ Principal Admin created:', principalUser.email);

    // 3. Create Staff Profiles for HR and Principal
    await prisma.staffProfile.upsert({
        where: { userId: hrUser.id },
        update: {},
        create: {
            staffId: 'STF-HR-001',
            userId: hrUser.id,
            name: 'HR Administrator',
            phone: '9876543210',
            deptId: 'ADMIN',
        },
    });

    await prisma.staffProfile.upsert({
        where: { userId: principalUser.id },
        update: {},
        create: {
            staffId: 'STF-PRIN-001',
            userId: principalUser.id,
            name: 'Dr. Principal',
            phone: '9876543211',
            deptId: 'ADMIN',
        },
    });

    // 4. Create Demo Staff (HOD of CSE)
    const hodUser = await prisma.user.upsert({
        where: { email: 'hod.cse@univ.com' },
        update: {},
        create: {
            email: 'hod.cse@univ.com',
            password: hashedPassword,
            userType: 'Staff',
            tagAccess: 'HOD',
            deptId: 'CSE',
            status: 'Active',
        },
    });

    await prisma.staffProfile.upsert({
        where: { userId: hodUser.id },
        update: {},
        create: {
            staffId: 'STF-CSE-001',
            userId: hodUser.id,
            name: 'Dr. HOD CSE',
            phone: '9876543212',
            deptId: 'CSE',
        },
    });
    console.log('✅ Demo HOD (CSE) created:', hodUser.email);

    // 5. Create Demo Student
    const studentUser = await prisma.user.upsert({
        where: { email: 'student@univ.com' },
        update: {},
        create: {
            email: 'student@univ.com',
            password: hashedPassword,
            userType: 'Student',
            tagAccess: 'Student',
            deptId: 'CSE',
            status: 'Active',
        },
    });

    await prisma.studentProfile.upsert({
        where: { userId: studentUser.id },
        update: {},
        create: {
            regNo: 'REG-2024-001',
            userId: studentUser.id,
            name: 'Demo Student',
            batchId: 'CSE-2024',
            profileLocked: false,
            admissionType: 'Counseling',
        },
    });
    console.log('✅ Demo Student created:', studentUser.email);

    console.log('\n🎉 Seeding complete! Demo accounts:');
    console.log('   HR Admin:    hr@univ.com / Admin123');
    console.log('   Principal:   principal@univ.com / Admin123');
    console.log('   HOD (CSE):   hod.cse@univ.com / Admin123');
    console.log('   Student:     student@univ.com / Admin123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
