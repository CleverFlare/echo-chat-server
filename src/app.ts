import bodyParser from "body-parser";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { registerHttpRoutes } from "./http";

const app = express();

declare module "express" {
  interface Request {
    token?: string;
  }
}

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use((_, res, next) => {
  const oldJson = res.json;

  res.json = (body: string) => {
    res.locals.data = body;
    return oldJson.call(res, body);
  };

  const oldSend = res.send;

  res.send = (body: string) => {
    res.locals.data = body;
    return oldSend.call(res, body);
  };

  next();
});

registerHttpRoutes(app);

export default app;
