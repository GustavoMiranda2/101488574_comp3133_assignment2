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

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOriginList.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    }
  })
);

app.use(express.json({ limit: "15mb" }));

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
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
