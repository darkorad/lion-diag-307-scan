const { exec } = require('child_process');

exec('npx vitest run', (error, stdout, stderr) => {
  if (error) {
    console.log(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
});