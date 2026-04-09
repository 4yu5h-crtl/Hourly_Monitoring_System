module.exports = {
  apps: [
    {
      name: "hms-backend",
      script: "./dist/server.js",
      cwd: "./server",
      instances: 5,
      exec_mode: "cluster",
      node_args: "--experimental-specifier-resolution=node",
      env: {
        NODE_ENV: "production",
        PORT: 5001
      }
    },
    {
      name: "hms-frontend",
      script: "./node_modules/serve/build/main.js",
      args: "-s dist -l 3000",
      cwd: ".",
      instances: 1,
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
