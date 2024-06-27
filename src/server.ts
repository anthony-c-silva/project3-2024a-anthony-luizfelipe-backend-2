import { PrismaClient } from '@prisma/client';
import fastify from 'fastify';
import { z } from 'zod';

const app = fastify({ logger: true });
const prisma = new PrismaClient();

// CRUD para tabela Usuario

app.get('/usuarios', async () => {
  const usuarios = await prisma.usuario.findMany({
    include: {
      abrigo: true,
    },
  });
  return { usuarios };
});

app.get('/usuarios/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const usuario = await prisma.usuario.findUnique({
    where: { id: Number(id) },
    include: {
      abrigo: true,
    },
  });
  return usuario ? { usuario } : reply.status(404).send({ error: 'Usuário não encontrado' });
});

app.post('/usuarios', async (request, reply) => {
  const createUsuarioSchema = z.object({
    nome: z.string(),
    email: z.string().email(),
    abrigoId: z.number(),
  });

  const { nome, email, abrigoId } = createUsuarioSchema.parse(request.body);

  await prisma.usuario.create({
    data: {
      nome,
      email,
      abrigoId,
    },
  });

  return reply.status(201).send();
});

app.put('/usuarios/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const updateUsuarioSchema = z.object({
    nome: z.string().optional(),
    email: z.string().email().optional(),
    abrigoId: z.number().optional(),
  });

  const data = updateUsuarioSchema.parse(request.body);

  await prisma.usuario.update({
    where: { id: Number(id) },
    data,
  });

  return reply.status(200).send();
});

app.delete('/usuarios/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  await prisma.usuario.delete({
    where: { id: Number(id) },
  });

  return reply.status(204).send();
});

// CRUD para tabela Abrigo

app.get('/abrigos', async () => {
  const abrigos = await prisma.abrigo.findMany({
    include: {
      usuarios: true,
      itens: true,
    },
  });
  return { abrigos };
});

app.get('/abrigos/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const abrigo = await prisma.abrigo.findUnique({
    where: { id: Number(id) },
    include: {
      usuarios: true,
      itens: true,
    },
  });
  return abrigo ? { abrigo } : reply.status(404).send({ error: 'Abrigo não encontrado' });
});

app.post('/abrigos', async (request, reply) => {
  const createAbrigoSchema = z.object({
    nome: z.string(),
    endereco: z.string(),
  });

  const { nome, endereco } = createAbrigoSchema.parse(request.body);

  await prisma.abrigo.create({
    data: {
      nome,
      endereco,
    },
  });

  return reply.status(201).send();
});

app.put('/abrigos/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const updateAbrigoSchema = z.object({
    nome: z.string().optional(),
    endereco: z.string().optional(),
  });

  const data = updateAbrigoSchema.parse(request.body);

  await prisma.abrigo.update({
    where: { id: Number(id) },
    data,
  });

  return reply.status(200).send();
});

app.delete('/abrigos/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  await prisma.abrigo.delete({
    where: { id: Number(id) },
  });

  return reply.status(204).send();
});

// CRUD para tabela Item

app.get('/itens', async () => {
  const itens = await prisma.item.findMany({
    include: {
      abrigo: true,
      doacoes: true,
    },
  });
  return { itens };
});

app.get('/itens/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const item = await prisma.item.findUnique({
    where: { id: Number(id) },
    include: {
      abrigo: true,
      doacoes: true,
    },
  });
  return item ? { item } : reply.status(404).send({ error: 'Item não encontrado' });
});

app.post('/itens', async (request, reply) => {
  const createItemSchema = z.object({
    nome: z.string(),
    descricao: z.string().optional(),
    quantidade: z.number(),
    abrigoId: z.number(),
  });

  const { nome, descricao, quantidade, abrigoId } = createItemSchema.parse(request.body);

  await prisma.item.create({
    data: {
      nome,
      descricao,
      quantidade,
      abrigoId,
    },
  });

  return reply.status(201).send();
});

app.put('/itens/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const updateItemSchema = z.object({
    nome: z.string().optional(),
    descricao: z.string().optional(),
    quantidade: z.number().optional(),
    abrigoId: z.number().optional(),
  });

  const data = updateItemSchema.parse(request.body);

  await prisma.item.update({
    where: { id: Number(id) },
    data,
  });

  return reply.status(200).send();
});

app.delete('/itens/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  await prisma.item.delete({
    where: { id: Number(id) },
  });

  return reply.status(204).send();
});

// CRUD para tabela Doacao

app.get('/doacoes', async () => {
  const doacoes = await prisma.doacao.findMany({
    include: {
      item: true,
    },
  });
  return { doacoes };
});

app.get('/doacoes/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const doacao = await prisma.doacao.findUnique({
    where: { id: Number(id) },
    include: {
      item: true,
    },
  });
  return doacao ? { doacao } : reply.status(404).send({ error: 'Doação não encontrada' });
});

app.post('/doacoes', async (request, reply) => {
  const createDoacaoSchema = z.object({
    itemId: z.number(),
    quantidade: z.number(),
    data: z.string(),
  });

  const { itemId, quantidade, data } = createDoacaoSchema.parse(request.body);

  await prisma.doacao.create({
    data: {
      itemId,
      quantidade,
      data: new Date(data),
    },
  });

  return reply.status(201).send();
});

app.put('/doacoes/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const updateDoacaoSchema = z.object({
    itemId: z.number().optional(),
    quantidade: z.number().optional(),
    data: z.string().optional(),
  });

  const data = updateDoacaoSchema.parse(request.body);

  await prisma.doacao.update({
    where: { id: Number(id) },
    data: {
      ...data,
      data: data.data ? new Date(data.data) : undefined,
    },
  });

  return reply.status(200).send();
});

app.delete('/doacoes/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  await prisma.doacao.delete({
    where: { id: Number(id) },
  });

  return reply.status(204).send();
});

app.listen(process.env.PORT || 3333, '0.0.0.0', (err, address) => {
  if (err) {
      app.log.error(err);
      process.exit(1);
  }
  app.log.info(`Servidor rodando em ${address}`);
});
