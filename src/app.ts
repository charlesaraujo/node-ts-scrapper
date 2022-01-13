import express, { Request, Response } from "express";
import mysql from "mysql";

const app = express();

const connectionString = process.env.DATABASE_URL || "";
const connection = mysql.createConnection(connectionString);
connection.connect();

const port = process.env.PORT || 3000;

app.get("/api/characteres", (req: Request, res: Response) => {
  const query = "SELECT * FROM Characters";

  connection.query(query, (err, rows) => {
    if (err) {
      return res.status(500).send(err);
    }
    const retVal = {
      data: rows,
      message: rows.length === 0 ? "Not found" : "Success",
    };
    return res.send(retVal);
  });
});

app.get("/api/characteres/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const query = `SELECT * FROM Characters WHERE id = "${id}" LIMIT 1`;

  connection.query(query, (err, rows) => {
    if (err) {
      return res.status(500).send(err);
    }
    const retVal = {
      data: rows.length > 0 ? rows[0] : null,
      message: rows.length === 0 ? "Not found" : "Success",
    };
    return res.send(retVal);
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
