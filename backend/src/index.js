//Name: Gustavo Miranda
//Student ID: 101488574

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");

const connectToDatabase = require("./config/database");
const seedWorkspaceData = require("./config/seed");
const schema = require("./graphql/schema");

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOriginList = (process.env.FRONTEND_ORIGIN || "http://localhost:4200")
  .split(",")
  .map((rawOrigin) => rawOrigin.trim())
  .filter(Boolean);
const vercelPreviewPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  

  if (allowedOriginList.includes(origin)) {
    return true;
  }

  return vercelPreviewPattern.test(origin);
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    }
  })
);

app.use(express.json({ limit: "15mb" }));

app.get("/", (_, response) => {
  response.json({
    service: "Employee Management GraphQL API",
    graphql: "/graphql",
    health: "/health"
  });
});

app.get("/health", (_, response) => {
  response.json({
    status: "ok"
  });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true
  })
);

async function startServer() {
  try {
    await connectToDatabase();
    await seedWorkspaceData();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
