import axios from 'axios';
import {jwtDecode} from "jwt-decode";

interface Item {
  nome: string;
  quantidade: number;
  categoria: string;
  abrigoId: number;
}

async function createItems(): Promise<void> {
  const loginData = {
    email: 'admin@example.com', // Substitua pelo seu email
    senha: 'strongPassword123' // Substitua pela sua senha
  };

  try {
    // Realiza o login e obtém o token
    const loginResponse = await axios.post('http://localhost:3333/login', loginData);
    const { token } = loginResponse.data;

    // Decodifica o token para obter o ID do abrigo
    const decodedToken: any = jwtDecode(token);
    const abrigoId = decodedToken.abrigoId;

    // Configura o token para as requisições subsequentes
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Inserção dos 50k itens
    for (let i = 0; i < 50000; i++) {
      const item: Item = {
        nome: `Item ${i}`,
        quantidade: Math.floor(Math.random() * 100) + 1,
        categoria: ['Alimentos', 'Remédios', 'Brinquedos'][Math.floor(Math.random() * 3)],
        abrigoId: abrigoId // Usando o abrigoId do token
      };

      try {
        await axios.post('http://localhost:3333/itens', item);
        console.log(`Item ${i} criado com sucesso!`);
      } catch (error: any) {
        console.error(`Erro ao criar o item ${i}:`, error.message);
      }
    }

    console.log('Inserção de 50k itens concluída!');
  } catch (error: any) {
    console.error('Erro ao fazer login ou inserir itens:', error.message);
  }
}

createItems();
