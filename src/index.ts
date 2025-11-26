import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/hello", (req, res) => {
  const name =
    typeof req.query.name === "string" && req.query.name.trim()
      ? req.query.name.trim()
      : "world";

  res.json({ message: `Hello, ${name}!` });
});

app.listen(port, () => {
  // Log startup to help users see where server is listening.
  console.log(`Server running at http://localhost:${port}`);
});
