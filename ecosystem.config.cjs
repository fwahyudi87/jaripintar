module.exports = {
  apps: [{
    name: 'jaripintar',
    script: 'npm',
    args: 'run dev',
    cwd: '/Users/septysucikirani/Documents/FWI/Repository/belajar-mengetik-anak',
    watch: ['src'],
    watch_delay: 500,
    ignore_watch: ['node_modules', 'dist'],
    env: {
      NODE_ENV: 'development',
    },
  }],
}
