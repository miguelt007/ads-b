// api/get-aircraft-data.js
import fetch from 'node-fetch'; // Para usar fetch no Node.js

export default async function handler(request, response) {
  // A chave de API é acessada através das variáveis de ambiente do Vercel
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
  const API_URL = 'https://aircraftscatter.p.rapidapi.com/lat/38.6892887/lon/-9.311829/';

  if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
    return response.status(500).json({ error: 'API keys not configured.' });
  }

  try {
    const apiResponse = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Error from RapidAPI:', apiResponse.status, errorText);
      return response.status(apiResponse.status).json({ error: `Failed to fetch data from external API: ${errorText}` });
    }

    const data = await apiResponse.json();
    response.status(200).json(data); // Envia os dados para o frontend
  } catch (error) {
    console.error('Error in serverless function:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
}
