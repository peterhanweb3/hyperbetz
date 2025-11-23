import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaClient: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaClient ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaClient = prisma
