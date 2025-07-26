// api/get-aircraft-data.js
import fetch from 'node-fetch'; // Para usar fetch no Node.js

export default async function handler(request, response) {
  // A chave de API é acessada através das variáveis de ambiente do Vercel
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
  const API_URL = 'https://aircraftscatter.p.rapidapi.com/lat/38.6892887/lon/-9.311829/';

  console.log('--- Função Serverless Iniciada ---');
  console.log('Verificando chaves de API...');

  if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
    console.error('ERRO: Chaves de API (RAPIDAPI_KEY ou RAPIDAPI_HOST) não configuradas no Vercel Environment Variables.');
    return response.status(500).json({ error: 'API keys not configured. Please check Vercel Environment Variables.' });
  }

  try {
    console.log('Fazendo requisição à RapidAPI:', API_URL);
    const apiResponse = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    console.log('Resposta da RapidAPI - Status:', apiResponse.status);
    console.log('Resposta da RapidAPI - Headers (Content-Type):', apiResponse.headers.get('content-type'));

    // Verifica se a resposta da RapidAPI foi bem-sucedida (status 2xx)
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text(); // Lê o corpo da resposta como texto
      console.error(`ERRO da RapidAPI: Status ${apiResponse.status}, Corpo: ${errorText}`);
      // Tenta retornar um JSON de erro para o frontend
      return response.status(apiResponse.status).json({ 
        error: `Failed to fetch data from external API: Status ${apiResponse.status}.`,
        details: errorText // Inclui o corpo do erro da RapidAPI para depuração
      });
    }

    // Verifica se a resposta é JSON antes de tentar fazer parse
    const contentType = apiResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await apiResponse.json(); // Tenta parsear como JSON
      console.log('Dados da RapidAPI recebidos e parseados com sucesso.');
      response.status(200).json(data); // Envia os dados JSON para o frontend
    } else {
      // Se não for JSON, lê como texto e retorna um erro
      const responseBody = await apiResponse.text();
      console.error('ERRO: RapidAPI não retornou JSON. Content-Type:', contentType, 'Corpo:', responseBody);
      return response.status(500).json({ 
        error: 'External API did not return JSON. Check API logs/status.', 
        responseBody: responseBody 
      });
    }

  } catch (error) {
    console.error('ERRO Geral na função serverless (bloco catch):', error.message);
    // Para erros inesperados, retorna um erro interno do servidor
    response.status(500).json({ error: 'Internal Server Error', details: error.message });
  } finally {
    console.log('--- Função Serverless Finalizada ---');
  }
}
