import prisma from './modules/blog/lib/db'
import { hashPassword } from './modules/blog/lib/auth'

async function resetAdminPassword() {
    try {
        const newPassword = 'admin123'
        const hashedPassword = await hashPassword(newPassword)

        const admin = await prisma.user.update({
            where: { username: 'admin' },
            data: { password: hashedPassword }
        })

        console.log('✅ Password reset successfully!')
        console.log('👤 Username: admin')
        console.log('🔑 Password: admin123')
        console.log('🆔 User ID:', admin.id)
    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

resetAdminPassword()
