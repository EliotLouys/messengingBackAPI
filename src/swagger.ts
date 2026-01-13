import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "My message API",
    description: "A minimal messenging API",
  },
  host: "localhost:3000",
  // 1. Switch to OpenAPI 3.0 to support correct Bearer auth
  openapi: "3.0.0",

  // 2. Define the Security Scheme properly for JWT
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT", // Tells Swagger it's a JWT
      },
    },
  },

  // 3. Apply security globally (we will disable it for login/register specifically)
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const outputFile = "./swagger-output.json";
const routes = ["./src/routes/routes.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, routes, doc);
