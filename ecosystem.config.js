module.exports = {
  apps: [
    {
      name: devbook,
      script: "./bin/www",
      instances: "max",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
  deploy: {
    production: {
      user: "node",
      // host : 'openfuel.org',
      ref: "origin/master",
      repo: "git@github.com:repo.git",
    },
  },
};
