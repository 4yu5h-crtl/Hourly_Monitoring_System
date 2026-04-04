module.exports = {
  apps: [
    {
      name: "hms-backend",
      script: "./dist/server.js",
      cwd: "./server",
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "hms-frontend",
      script: "./node_modules/serve/build/main.js",
      args: "-s dist -l 3000",
      cwd: ".",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
