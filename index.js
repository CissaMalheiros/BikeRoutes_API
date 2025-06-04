import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';

// Configurações
dotenv.config();
const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o banco
const pool = new Pool();

// Teste rota
app.get('/', (req, res) => {
  res.send('API BikeRoutes Online');
});

// Cadastrar/atualizar usuário
app.post('/usuarios', async (req, res) => {
  // Recebe todos os dados do usuário
  const {
    cpf, nome, telefone, sexo, email, dataNascimento, senha,
    fabricante, modelo, serial, versao
  } = req.body;
  try {
    // Tenta inserir ou atualizar pelo email
    const result = await pool.query(
      `INSERT INTO usuarios (cpf, nome, telefone, sexo, email, data_nascimento, senha, fabricante, modelo, serial, versao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (email) DO UPDATE SET
         cpf = EXCLUDED.cpf,
         nome = EXCLUDED.nome,
         telefone = EXCLUDED.telefone,
         sexo = EXCLUDED.sexo,
         data_nascimento = EXCLUDED.data_nascimento,
         senha = EXCLUDED.senha,
         fabricante = EXCLUDED.fabricante,
         modelo = EXCLUDED.modelo,
         serial = EXCLUDED.serial,
         versao = EXCLUDED.versao
       RETURNING *`,
      [cpf, nome, telefone, sexo, email, dataNascimento, senha, fabricante, modelo, serial, versao]
    );
    console.log('Usuário salvo/atualizado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao salvar usuário:', err);
    res.status(500).json({ error: err.message });
  }
});

// Cadastrar rota
app.post('/rotas', async (req, res) => {
  const { usuario_id, tipo, tempo, coordenadas } = req.body;
  console.log('Recebendo rota:', { usuario_id, tipo, tempo, coordenadas });
  try {
    // Verifica se o usuário existe
    const usuarioResult = await pool.query('SELECT id FROM usuarios WHERE id = $1', [usuario_id]);
    if (usuarioResult.rows.length === 0) {
      console.log('Usuário não encontrado no banco de dados:', usuario_id);
      return res.status(400).json({ error: 'Usuário não encontrado no banco de dados.' });
    }
    const rotaResult = await pool.query(
      'INSERT INTO rotas (usuario_id, tipo, tempo) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, tipo, tempo]
    );
    console.log('Rota salva:', rotaResult.rows[0]);
    const rota_id = rotaResult.rows[0].id;
    // Inserir coordenadas
    if (Array.isArray(coordenadas)) {
      for (const coord of coordenadas) {
        const lat = coord.latitude !== undefined ? coord.latitude : (coord.coords ? coord.coords.latitude : null);
        const lng = coord.longitude !== undefined ? coord.longitude : (coord.coords ? coord.coords.longitude : null);
        const timestamp = coord.timestamp ?? null;
        // Converter timestamp JS (ms) para segundos e para formato ISO
        let timestampISO = null;
        if (timestamp !== null) {
          try {
            timestampISO = new Date(Number(timestamp)).toISOString();
          } catch (e) {
            console.log('Erro ao converter timestamp:', timestamp, e);
          }
        }
        console.log('Tentando salvar coordenada:', { lat, lng, timestamp, timestampISO });
        if (lat !== null && lng !== null && timestampISO !== null) {
          await pool.query(
            'INSERT INTO coordenadas (rota_id, latitude, longitude, timestamp) VALUES ($1, $2, $3, $4)',
            [rota_id, lat, lng, timestampISO]
          );
          console.log('Coordenada salva:', { rota_id, lat, lng, timestampISO });
        } else {
          console.log('Coordenada ignorada por estar incompleta:', coord);
        }
      }
    }
    res.json({ rota: rotaResult.rows[0] });
  } catch (err) {
    console.error('Erro ao salvar rota:', err);
    res.status(500).json({ error: err.message });
  }
});

// Listar rotas de um usuário
app.get('/rotas/:usuario_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rotas WHERE usuario_id = $1', [req.params.usuario_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar coordenadas de uma rota
app.get('/coordenadas/:rota_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coordenadas WHERE rota_id = $1', [req.params.rota_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar usuário por email
app.get('/usuarios/email/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar usuário por email:', err);
    res.status(500).json({ error: err.message });
  }
});

// Limpar todas as tabelas do banco (apenas para testes/desenvolvimento)
app.post('/limpar-banco', async (req, res) => {
  try {
    await pool.query('DELETE FROM coordenadas');
    await pool.query('DELETE FROM rotas');
    await pool.query('DELETE FROM usuarios');
    res.json({ ok: true, message: 'Banco limpo com sucesso!' });
  } catch (err) {
    console.error('Erro ao limpar banco:', err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`APIByke rodando na porta ${port}`);
});
