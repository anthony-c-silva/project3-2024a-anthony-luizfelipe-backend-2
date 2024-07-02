import { PrismaClient } from '@prisma/client';
import fastify from 'fastify';
import { z } from 'zod';
import fastifyCors from 'fastify-cors';
import fastifyJwt from 'fastify-jwt';
import bcrypt from 'bcrypt';

const app = fastify();
const prisma = new PrismaClient();

// Middleware de CORS
const corsOptions = {
  origin: ['https://endearing-starship-fe8800.netlify.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.register(fastifyCors, corsOptions);

// Configuração do JWT
app.register(fastifyJwt, {
  secret: 'supersecretkey',
});

// Middleware de autenticação
app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Middleware de autorização para administrador
app.decorate('authorizeAdmin', async (request, reply) => {
  if (!request.user.isAdmin) {
    reply.status(403).send({ error: 'Acesso negado' });
  }
});

// Endpoint para criar o primeiro administrador
app.post('/primeiro-admin', async (request, reply) => {
  const createAdminSchema = z.object({
    nomeUsuario: z.string(),
    senha: z.string(),
    email: z.string().email(),
    abrigoId: z.number(),
  });

  const { nomeUsuario, senha, email, abrigoId } = createAdminSchema.parse(request.body);

  const adminExists = await prisma.usuario.findFirst({
    where: { isAdmin: true },
  });

  if (adminExists) {
    return reply.status(400).send({ error: 'Administrador já existe' });
  }

  const hashedSenha = await bcrypt.hash(senha, 10);

  try {
    await prisma.usuario.create({
      data: { nomeUsuario, senha: hashedSenha, email, abrigoId, isAdmin: true },
    });
    return reply.status(201).send();
  } catch (e) {
    if (e.code === 'P2002') {
      return reply.status(400).send({ error: 'Email já está em uso' });
    }
    throw e;
  }
});

// Endpoints de Abrigos (protegidos para administrador)
app.post('/abrigos', { preValidation: [app.authenticate, app.authorizeAdmin] }, async (request, reply) => {
  const createAbrigoSchema = z.object({
    nome: z.string(),
    endereco: z.string(),
  });

  const { nome, endereco } = createAbrigoSchema.parse(request.body);

  try {
    await prisma.abrigo.create({
      data: { nome, endereco },
    });
    return reply.status(201).send();
  } catch (e) {
    if (e.code === 'P2002') {
      return reply.status(400).send({ error: 'Abrigo já existe' });
    }
    throw e;
  }
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

// Endpoints de Itens (protegidos para administrador)
app.post('/itens', { preValidation: [app.authenticate, app.authorizeAdmin] }, async (request, reply) => {
  const createItemSchema = z.object({
    nome: z.string(),
    quantidade: z.number(),
    categoria: z.string(),
    abrigoId: z.number(),
  });

  const { nome, quantidade, categoria, abrigoId } = createItemSchema.parse(request.body);

  try {
    await prisma.item.create({
      data: { nome, quantidade, categoria, abrigoId },
    });
    return reply.status(201).send();
  } catch (e) {
    if (e.code === 'P2002') {
      return reply.status(400).send({ error: 'Item já existe' });
    }
    throw e;
  }
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
app.post('/usuarios', { preValidation: [app.authenticate, app.authorizeAdmin] }, async (request, reply) => {
  const createUsuarioSchema = z.object({
    nomeUsuario: z.string(),
    senha: z.string(),
    email: z.string().email(),
    abrigoId: z.number(),
  });

  const { nomeUsuario, senha, email, abrigoId } = createUsuarioSchema.parse(request.body);

  const hashedSenha = await bcrypt.hash(senha, 10);

  try {
    await prisma.usuario.create({
      data: { nomeUsuario, senha: hashedSenha, email, abrigoId, isAdmin: false },
    });
    return reply.status(201).send();
  } catch (e) {
    if (e.code === 'P2002') {
      return reply.status(400).send({ error: 'Email já está em uso' });
    }
    throw e;
  }
});

app.post('/login', async (request, reply) => {
  const loginSchema = z.object({
    email: z.string().email(),
    senha: z.string(),
  });

  const { email, senha } = loginSchema.parse(request.body);

  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return reply.status(401).send({ error: 'Credenciais inválidas' });
  }

  const token = app.jwt.sign({
    id: usuario.id,
    email: usuario.email,
    isAdmin: usuario.isAdmin,
  });

  return reply.send({ token });
});

app.get('/usuarios', { preValidation: [app.authenticate, app.authorizeAdmin] }, async () => {
  const usuarios = await prisma.usuario.findMany();
  return { usuarios };
});

app.get('/usuarios/:id', { preValidation: [app.authenticate, app.authorizeAdmin] }, async (request) => {
  const { id } = request.params as { id: string };
  const usuario = await prisma.usuario.findUnique({
    where: { id: Number(id) },
  });

  return { usuario };
});

app.put('/usuarios/:id', { preValidation: [app.authenticate, app.authorizeAdmin] }, async (request) => {
  const { id } = request.params as { id: string };
  const updateUsuarioSchema = z.object({
    nomeUsuario: z.string(),
    senha: z.string(),
    email: z.string().email(),
    abrigoId: z.number(),
    isAdmin: z.boolean(),
  });

  const { nomeUsuario, senha, email, abrigoId, isAdmin } = updateUsuarioSchema.parse(request.body);

  const hashedSenha = await bcrypt.hash(senha, 10);

  await prisma.usuario.update({
    where: { id: Number(id) },
    data: { nomeUsuario, senha: hashedSenha, email, abrigoId, isAdmin },
  });

  return { message: 'Usuário atualizado com sucesso' };
});

app.delete('/usuarios/:id', { preValidation: [app.authenticate, app.authorizeAdmin] }, async (request) => {
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

// Inicie o servidor
const start = async () => {
  try {
    await app.listen(process.env.PORT || 3333, '0.0.0.0');
    app.log.info(`Servidor rodando em ${app.server.address()}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
