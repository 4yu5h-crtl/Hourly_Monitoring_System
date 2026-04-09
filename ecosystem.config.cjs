module.exports = {
  apps: [
    {
      name: "hms-backend",
      script: "node",
      args: "./dist/server.js",
      cwd: "./server",
      node_args: "--experimental-specifier-resolution=node",
      env: {
        NODE_ENV: "production",
        PORT: 5001
      }
    },
    {
      name: "hms-frontend",
      script: "node",
      args: "./node_modules/serve/build/main.js -s dist -l 5174",
      cwd: ".",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
