import {PrismaClient} from '@prisma/client'
import fastify from 'fastify'
import {z} from 'zod'

const app = fastify()

const prisma = new PrismaClient()

app.get('/usuarios', async() =>{
    const usuarios = await prisma.user.findMany()

    return {usuarios}
})

app.post('/usuarios', async (request, reply)=>{
    const createUserSchema = z.object({
        nome: z.string(),
        email:z.string().email(),
    })

    const {nome, email} = createUserSchema.parse(request.body)

    await prisma.user.create({
        data:{
            nome,
            email,
        }
    })
    return reply.status(201)
})

app.listen({
    host:'0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(()=>{
    console.log('Rodando Server HTTP')
})