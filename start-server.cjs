// Simple script to start the server with better error handling
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting SustainAride server...');

// Path to the server.cjs file
const serverPath = path.join(__dirname, 'server', 'server.cjs');

// Spawn server process
const serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'development'
    }
});

// Handle process events
serverProcess.on('error', (err) => {
    console.error('Failed to start server process:', err);
});

process.on('SIGINT', () => {
    console.log('Stopping server...');
    serverProcess.kill('SIGINT');
    process.exit();
});