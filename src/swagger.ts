import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "My message API",
    description: "A minimal messenging API",
  },
  host: "localhost:3000",
  schemes: ["http"],
  // This section is for the JWT Auth configuration in Swagger
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description:
        'Enter your token with the "Bearer " prefix, e.g. "Bearer eyJ..."',
    },
  },
  // Apply this security globally (optional, but good for your protected API)
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const outputFile = "./swagger-output.json";
const routes = ["./src/routes/routes.ts"]; // <--- Point to your main routes file

/* NOTE: If you are using 'ts-node', you need to run this script 
   before starting the app, or use the generated JSON file. */

swaggerAutogen()(outputFile, routes, doc);
