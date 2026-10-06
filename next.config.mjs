/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite conexões externas, túneis do ngrok e dispositivos na rede sem bloqueios de CORS/Host
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.ngrok-free.app',
        '*.ngrok.app',
        '*.ngrok.io',
        '*.loca.lt'
      ]
    }
  }
};

export default nextConfig;
