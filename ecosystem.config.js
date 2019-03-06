module.exports = {
  apps: [
    {
      name: "astrograph-server",
      script: "./dist/graphql_server.js",
      instances: 1,
      exp_backoff_restart_delay: 100,
      autorestart: true,
      watch: false,
      port: 4000,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "astrograph-ingest",
      script: "./dist/ingestd.js",
      instances: 1,
      exp_backoff_restart_delay: 100,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ],
  deploy: {
    production: {
      repo: "git@github.com:astroband/astrograph.git",
      ref: "origin/master",
      host: "astrograph.evilmartians.io",
      user: "deploy",
      ssh_options: "StrictHostKeyChecking=no",
      path: "/var/www/astrograph/source",
      "pre-setup": "ls -la; echo 'pre-setup'",
      "post-setup": "ls -la; echo 'post-setup'",
      "pre-deploy-local": "yarn build:production",
      "post-deploy": "yarn install; pm2 startOrRestart astrograph --env production"
    }
  }
};
