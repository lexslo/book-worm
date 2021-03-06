const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const db = require('./config/connection');
const path = require('path');

const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware
  });

  // Start the Apollo Server
  await server.start();

  // apply apollo server as Express middleware
  server.applyMiddleware({ app });

  // log URL for GraphQL testing
  console.log(`Test GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
}

// Initialize the Apollo server
startServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => console.log(`API Server running on port:${PORT}`));
});
