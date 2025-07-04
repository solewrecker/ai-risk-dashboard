export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};

// For production, use specific domain(s) instead of '*'
export const corsHeadersProduction = {
  'Access-Control-Allow-Origin': 'https://solewrecker.github.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};

// Helper function to handle CORS preflight
export function handleCors(req, headers = corsHeaders) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers
    });
  }
  return null;
}

// Helper function to create response with CORS headers
export function createCorsResponse(data, status = 200, headers = corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    }
  });
} 