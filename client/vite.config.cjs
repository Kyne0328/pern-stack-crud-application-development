module.exports = async function createViteConfig() {
  const {default: react} = await import('@vitejs/plugin-react');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  };
};
