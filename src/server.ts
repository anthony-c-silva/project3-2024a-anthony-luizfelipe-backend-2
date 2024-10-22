import { PrismaClient } from '@prisma/client';
import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import fastifyCors from '@fastify/cors';
import fastifyJwt, { FastifyJWTOptions } from '@fastify/jwt';
import bcrypt from 'bcrypt';

// Tipagem para incluir o campo `user` na requisição
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  // Declaração da tipagem correta do JWT para incluir `isAdmin`
  interface FastifyJWT {
    payload: { id: number; nome: string; email: string; isAdmin: boolean; abrigoId: number };
    user: { id: number; nome: string; email: string; isAdmin: boolean; abrigoId: number };
  }
}

const app: FastifyInstance = fastify();
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
  secret: 'supersecretkey'
} as FastifyJWTOptions);

// Middleware de autenticação
app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Aqui, o Fastify agora entende que `request.user` tem a estrutura correta com `isAdmin`
    await request.jwtVerify<{ id: number; nome: string; email: string; isAdmin: boolean; abrigoId: number }>();
  } catch (err) {
    reply.send(err);
  }
});

// Middleware para autorizar administrador
const authorizeAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user as { id: number; nome: string; email: string; isAdmin: boolean; abrigoId: number };
  
  if (!user || !user.isAdmin) {
    return reply.status(403).send({ error: 'Acesso negado' });
  }
};


// Endpoint para criar o primeiro administrador junto com o abrigo
app.post('/primeiro-admin', async (request, reply) => {
  const createAdminSchema = z.object({
    nomeUsuario: z.string(),
    senha: z.string(),
    email: z.string().email(),
    abrigo: z.object({
      nome: z.string(),
      endereco: z.string(),
    }),
  });

  const { nomeUsuario, senha, email, abrigo } = createAdminSchema.parse(request.body);
  const hashedSenha = await bcrypt.hash(senha, 10);

  try {
    const novoAbrigo = await prisma.abrigo.create({
      data: abrigo,
    });

    await prisma.usuario.create({
      data: {
        nomeUsuario,
        senha: hashedSenha,
        email,
        abrigoId: novoAbrigo.id,
        isAdmin: true,  // Primeiro usuário é o administrador
      },
    });

    return reply.status(201).send();
  } catch (e) {
    if (typeof e === 'object' && e !== null && 'code' in e) {
      if ((e as any).code === 'P2002') {
        return reply.status(400).send({ error: 'Email já está em uso' });
      }
    }
    throw e;  // Re-throw se não for o erro específico
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
// Endpoints de Abrigos (protegidos para administrador)
app.post('/abrigos', { preValidation: [app.authenticate] }, async (request, reply) => {
  const user = request.user as { id: number; nome: string; email: string; isAdmin: boolean; abrigoId: number };
  
  if (!user.isAdmin) {
    return reply.status(403).send({ error: 'Acesso negado' });
  }

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
    if (typeof e === 'object' && e !== null && 'code' in e) {
      if ((e as any).code === 'P2002') {
        return reply.status(400).send({ error: 'Abrigo já existe' });
      }
    }
    throw e;  // Re-lança o erro se não for o caso tratado
  }  
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
app.post('/itens', { preValidation: [app.authenticate] }, async (request, reply) => {
  // Tipando corretamente o request.user
  const user = request.user as { id: number; nome: string; email: string; isAdmin: boolean; abrigoId: number };

  if (!user.isAdmin) {
    return reply.status(403).send({ error: 'Acesso negado' });
  }

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
  } catch (e: any) {
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
app.post('/usuarios', async (request, reply) => {
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
    // Verifica se `e` é um objeto e se tem a propriedade `code`
    if (typeof e === 'object' && e !== null && 'code' in e) {
      const error = e as { code?: string }; // Tipando `e` para acessar `code`
      if (error.code === 'P2002') {
        return reply.status(400).send({ error: 'Email já está em uso' });
      }
    }
    throw e; // Re-lança o erro se não for o caso tratado
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
    nome: usuario.nomeUsuario,
    email: usuario.email,
    isAdmin: usuario.isAdmin,
    abrigoId: usuario.abrigoId,
  });

  return reply.send({ token });
});

app.get('/usuarios', { preValidation: [app.authenticate, authorizeAdmin] }, async () => {
  const usuarios = await prisma.usuario.findMany();
  return { usuarios };
});

app.get('/usuarios/:id', { preValidation: [app.authenticate, authorizeAdmin] }, async (request) => {
  const { id } = request.params as { id: string };
  const usuario = await prisma.usuario.findUnique({
    where: { id: Number(id) },
  });

  return { usuario };
});

app.put('/usuarios/:id', { preValidation: [app.authenticate, authorizeAdmin] }, async (request) => {
  const { id } = request.params as { id: string };
  const updateUsuarioSchema = z.object({
    nomeUsuario: z.string(),
    senha: z.string(),
    email: z.string().email(),
    abrigoId: z.number(),
  });

  const { nomeUsuario, senha, email, abrigoId } = updateUsuarioSchema.parse(request.body);

  const hashedSenha = await bcrypt.hash(senha, 10);

  await prisma.usuario.update({
    where: { id: Number(id) },
    data: { nomeUsuario, senha: hashedSenha, email, abrigoId },
  });

  return { message: 'Usuário atualizado com sucesso' };
});

app.delete('/usuarios/:id', { preValidation: [app.authenticate, authorizeAdmin] }, async (request) => {
  const { id } = request.params as { id: string };

  await prisma.usuario.delete({
    where: { id: Number(id) },
  });

  return { message: 'Usuário deletado com sucesso' };
});
// Endpoint para incrementar a quantidade de um item
app.put('/itens/:id/incremento', { preValidation: [app.authenticate] }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const incrementSchema = z.object({
    quantidade: z.number().positive(),
  });

  const { quantidade } = incrementSchema.parse(request.body);

  try {
    const item = await prisma.item.update({
      where: { id: Number(id) },
      data: {
        quantidade: {
          increment: quantidade,
        },
      },
    });

    return reply.status(200).send({ message: 'Quantidade incrementada com sucesso', item });
  } catch (e) {
    reply.status(400).send({ error: 'Erro ao incrementar a quantidade' });
    throw e;
  }
});
// Endpoint para decrementar a quantidade de um item
app.put('/itens/:id/decremento', { preValidation: [app.authenticate] }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const decrementSchema = z.object({
    quantidade: z.number().positive(),
  });

  const { quantidade } = decrementSchema.parse(request.body);

  try {
    const item = await prisma.item.findUnique({
      where: { id: Number(id) },
    });

    if (!item) {
      return reply.status(404).send({ error: 'Item não encontrado' });
    }

    const novaQuantidade = item.quantidade - quantidade;

    if (novaQuantidade < 0) {
      return reply.status(400).send({ error: 'Quantidade não pode ser menor que zero' });
    }

    const itemAtualizado = await prisma.item.update({
      where: { id: Number(id) },
      data: {
        quantidade: novaQuantidade,
      },
    });

    return reply.status(200).send({ message: 'Quantidade decrementada com sucesso', item: itemAtualizado });
  } catch (e) {
    reply.status(400).send({ error: 'Erro ao decrementar a quantidade' });
    throw e;
  }
});

// Endpoints de Doações (CRUD)
app.post('/doacoes', { preValidation: [app.authenticate] }, async (request, reply) => {
  const createDoacaoSchema = z.object({
    quantidade: z.number(),
    data: z.date(),
    itemId: z.number(),
  });

  const { quantidade, data, itemId } = createDoacaoSchema.parse(request.body);

  try {
    await prisma.doacao.create({
      data: { quantidade, data, itemId },
    });
    return reply.status(201).send();
  } catch (e) {
    throw e;
  }
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
    data: z.date(),
    itemId: z.number(),
  });

  const { quantidade, data, itemId } = updateDoacaoSchema.parse(request.body);

  await prisma.doacao.update({
    where: { id: Number(id) },
    data: { quantidade, data, itemId },
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




//Inicie o servidor
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3333;
    await app.listen({
      port: port,
      host: '0.0.0.0',
    });
    console.log(`Servidor rodando na porta ${port}`);
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err); // Adicionar log explícito para erros
    app.log.error(err);
    process.exit(1);
  }
};
start();





