import express from "express";
import mongoose from "mongoose";
import routes from "./routes/accountsRouter.js";

(async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://bank-api:123@cluster0.bu8po.mongodb.net/bank-api?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection error" + error);
  }
})();

const app = express();
app.use(express.json());

app.use(routes);

app.listen(3333, () => console.log("server running"));
