const httpServer = require('http-server');
const cors = require('cors');

const server = httpServer.createServer({
  root: '.',  // Set the root directory for serving files
  cors: true, // Enable CORS
  headers: {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET', // Allow only GET requests
    'Access-Control-Allow-Headers': 'Content-Type' // Allow only Content-Type header
  }
});

server.listen(9090, () => {
  console.log('Server is running on http://localhost:9090');
});
