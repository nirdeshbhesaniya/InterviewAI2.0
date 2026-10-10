module.exports = {
  apps: [
    {
      name: 'interview-ai-backend',
      script: 'server.js',
      cwd: './backend',
      instances: 1,             // Use 1 for t2.micro/t3.micro (Free Tier) to avoid memory exhaustion; increase to 'max' for multi-core instances
      exec_mode: 'fork',        // Use 'fork' for single instance, or 'cluster' for multi-instance load balancing
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      merge_logs: true,
      time: true
    }
  ]
};
