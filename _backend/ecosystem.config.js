module.exports = {
  apps : [{
    script: 'server.js',
    autorestart: true,
    watch: '.',
    env: {
      PORT: 3500,
      NOD_ENV: 'production'
    }
  }]
};
