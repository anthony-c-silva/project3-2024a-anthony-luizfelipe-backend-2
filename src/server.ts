import { PrismaClient } from '@prisma/client';
import fastify from 'fastify';
import { z } from 'zod';

const app = fastify();
const prisma = new PrismaClient();

// Endpoints de Abrigos
app.post('/abrigos', async (request, reply) => {
  const createAbrigoSchema = z.object({
    nome: z.string(),
    endereco: z.string(),
  });

  const { nome, endereco } = createAbrigoSchema.parse(request.body);

  await prisma.abrigo.create({
    data: { nome, endereco },
  });

  return reply.status(201).send();
});

app.get('/abrigos', async () => {
  const abrigos = await prisma.abrigo.findMany();
  return { abrigos };
});

app.get('/abrigos/:id', async (request) => {
  const { id } = request.params as { id: string };
  const abrigo = await prisma.abrigo.findUnique({
    where: { id: Number(id) },
  });

  return { abrigo };
});

app.put('/abrigos/:id', async (request) => {
  const { id } = request.params as { id: string };
  const updateAbrigoSchema = z.object({
    nome: z.string(),
    endereco: z.string(),
  });

  const { nome, endereco } = updateAbrigoSchema.parse(request.body);

  await prisma.abrigo.update({
    where: { id: Number(id) },
    data: { nome, endereco },
  });

  return { message: 'Abrigo atualizado com sucesso' };
});

app.delete('/abrigos/:id', async (request) => {
  const { id } = request.params as { id: string };

  await prisma.abrigo.delete({
    where: { id: Number(id) },
  });

  return { message: 'Abrigo deletado com sucesso' };
});

// Endpoints de Itens
app.post('/itens', async (request, reply) => {
  const createItemSchema = z.object({
    nome: z.string(),
    quantidade: z.number(),
    categoria: z.string(),
    abrigoId: z.number(),
  });

  const { nome, quantidade, categoria, abrigoId } = createItemSchema.parse(request.body);

  await prisma.item.create({
    data: { nome, quantidade, categoria, abrigoId },
  });

  return reply.status(201).send();
});

app.get('/itens', async () => {
  const itens = await prisma.item.findMany();
  return { itens };
});

app.get('/itens/:id', async (request) => {
  const { id } = request.params as { id: string };
  const item = await prisma.item.findUnique({
    where: { id: Number(id) },
  });

  return { item };
});

app.put('/itens/:id', async (request) => {
  const { id } = request.params as { id: string };
  const updateItemSchema = z.object({
    nome: z.string(),
    quantidade: z.number(),
    categoria: z.string(),
    abrigoId: z.number(),
  });

  const { nome, quantidade, categoria, abrigoId } = updateItemSchema.parse(request.body);

  await prisma.item.update({
    where: { id: Number(id) },
    data: { nome, quantidade, categoria, abrigoId },
  });

  return { message: 'Item atualizado com sucesso' };
});

app.delete('/itens/:id', async (request) => {
  const { id } = request.params as { id: string };

  await prisma.item.delete({
    where: { id: Number(id) },
  });

  return { message: 'Item deletado com sucesso' };
});

// Endpoints de Usuários
app.post('/usuarios', async (request, reply) => {
  const createUsuarioSchema = z.object({
    nomeUsuario: z.string(),
    senha: z.string(),
    email: z.string().email(),
    abrigoId: z.number(),
  });

  const { nomeUsuario, senha, email, abrigoId } = createUsuarioSchema.parse(request.body);

  await prisma.usuario.create({
    data: { nomeUsuario, senha, email, abrigoId },
  });

  return reply.status(201).send();
});

app.get('/usuarios', async () => {
  const usuarios = await prisma.usuario.findMany();
  return { usuarios };
});

app.get('/usuarios/:id', async (request) => {
  const { id } = request.params as { id: string };
  const usuario = await prisma.usuario.findUnique({
    where: { id: Number(id) },
  });

  return { usuario };
});

app.put('/usuarios/:id', async (request) => {
  const { id } = request.params as { id: string };
  const updateUsuarioSchema = z.object({
    nomeUsuario: z.string(),
    senha: z.string(),
    email: z.string().email(),
    abrigoId: z.number(),
  });

  const { nomeUsuario, senha, email, abrigoId } = updateUsuarioSchema.parse(request.body);

  await prisma.usuario.update({
    where: { id: Number(id) },
    data: { nomeUsuario, senha, email, abrigoId },
  });

  return { message: 'Usuário atualizado com sucesso' };
});

app.delete('/usuarios/:id', async (request) => {
  const { id } = request.params as { id: string };

  await prisma.usuario.delete({
    where: { id: Number(id) },
  });

  return { message: 'Usuário deletado com sucesso' };
});

// Endpoints de Doações
app.post('/doacoes', async (request, reply) => {
  const createDoacaoSchema = z.object({
    quantidade: z.number(),
    data: z.string(),
    itemId: z.number(),
  });

  const { quantidade, data, itemId } = createDoacaoSchema.parse(request.body);

  await prisma.doacao.create({
    data: { quantidade, data: new Date(data), itemId },
  });

  return reply.status(201).send();
});

app.get('/doacoes', async () => {
  const doacoes = await prisma.doacao.findMany();
  return { doacoes };
});

app.get('/doacoes/:id', async (request) => {
  const { id } = request.params as { id: string };
  const doacao = await prisma.doacao.findUnique({
    where: { id: Number(id) },
  });

  return { doacao };
});

app.put('/doacoes/:id', async (request) => {
  const { id } = request.params as { id: string };
  const updateDoacaoSchema = z.object({
    quantidade: z.number(),
    data: z.string(),
    itemId: z.number(),
  });

  const { quantidade, data, itemId } = updateDoacaoSchema.parse(request.body);

  await prisma.doacao.update({
    where: { id: Number(id) },
    data: { quantidade, data: new Date(data), itemId },
  });

  return { message: 'Doação atualizada com sucesso' };
});

app.delete('/doacoes/:id', async (request) => {
  const { id } = request.params as { id: string };

  await prisma.doacao.delete({
    where: { id: Number(id) },
  });

  return { message: 'Doação deletada com sucesso' };
});

app.listen({
  host: '0.0.0.0',
  port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
  console.log('Rodando Server HTTP');
});


