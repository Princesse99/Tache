const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "gestion_tache",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database");
  }
});

// Socket.io Setup
io.on("connection", (socket) => {
  console.log("Utilisateur connecté:", socket.id);

  socket.on("task-assigned", (data) => {
    socket.to(data.userId).emit("task-assigned", data);
  });

  socket.on("validate-task", (taskId, userId) => {
    socket.to(userId).emit("task-validated", { taskId, userId });
  });

  socket.on("notification-received", (data) => {
    socket.to(data.userId).emit("notification-received", data);
  });

  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté:", socket.id);
  });
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// User Routes
app.post("/api/login", (req, res) => {
  const { email, password, role } = req.body;
  const sql =
    "SELECT * FROM utilisateur WHERE Email = ? AND Mot_Passe = ? AND Role = ?";
  db.query(sql, [email, password, role], (err, results) => {
    if (err) {
      console.error("Error verifying user:", err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length > 0) {
      res.json({
        success: true,
        role: results[0].Role,
        userId: results[0].ID,
        profileImage: results[0].Image,
        userName: results[0].Nom,
      });
    } else {
      res.json({ success: false });
    }
  });
});

app.post("/api/utilisateurs", upload.single("image"), (req, res) => {
  const { nom, email, mot_passe, role } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : "";

  const sql =
    "INSERT INTO utilisateur (Nom, Email, Mot_Passe, Image, Role) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [nom, email, mot_passe, image, role], (err, result) => {
    if (err) {
      console.error("Error inserting user:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: "Utilisateur ajouté avec succès",
      id: result.insertId,
      image,
    });
  });
});

app.get("/api/utilisateurs", (req, res) => {
  const sql = "SELECT * FROM utilisateur";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.put("/api/utilisateurs/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { nom, email, mot_passe, role } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

  const sql =
    "UPDATE utilisateur SET Nom = ?, Email = ?, Mot_Passe = ?, Image = ?, Role = ? WHERE ID = ?";
  db.query(sql, [nom, email, mot_passe, image, role, id], (err, result) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Utilisateur modifié avec succès", image });
  });
});

app.delete("/api/utilisateurs/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM utilisateur WHERE ID = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Utilisateur supprimé avec succès" });
  });
});

// Task Routes
app.get("/api/tasks", (req, res) => {
  const sql = `
        SELECT t.*, u.Nom as Nom_utilisateur, u.Image as Image_utilisateur
        FROM task t
        LEFT JOIN utilisateur u ON t.ID = u.ID
    `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.post("/api/tasks", (req, res) => {
  const task = req.body;
  const sql = "INSERT INTO task SET ?";
  db.query(sql, task, (err, result) => {
    if (err) {
      console.error("Error adding task:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ ...task, Id_tache: result.insertId });
  });
});
// Task Routes
app.get("/api/tasks/user/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT * FROM task WHERE ID = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching user tasks:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const task = req.body;
  const sql = "UPDATE task SET ? WHERE Id_tache = ?";
  db.query(sql, [task, id], (err, result) => {
    if (err) {
      console.error("Error updating task:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ ...task, Id_tache: id });
  });
});

app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM task WHERE Id_tache = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting task:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(204).send();
  });
});

app.get("/api/taskCounts", (req, res) => {
  const sql = `
        SELECT
            (SELECT COUNT(*) FROM task) AS totalTaches,
            (SELECT COUNT(*) FROM task WHERE Status = 'En cours') AS tachesEnCours,
            (SELECT COUNT(*) FROM task WHERE Status = 'Terminer') AS tachesTerminees,
            (SELECT COUNT(*) FROM task WHERE Status = 'En attente') AS tachesEnAttente
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching task counts:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});
//notificat
app.post("/api/create-notification", (req, res) => {
  const { Id_tache, tache, utilisateur, date, id_user } = req.body;
  console.log("arrivage de requete");
  const message = `utilisateur ${utilisateur} a executer la tache ${tache} a la date ${date} `;

  const sql =
    "INSERT INTO `notification`( `message`, `ID`, `Id_tache`) VALUES (?, ?, ?)";
  db.query(sql, [message, id_user, Id_tache], (err, result) => {
    if (err) {
      console.log("Error", err);
      return res.status(500).send(JSON.stringify({ err: err.message }));
    }

    const sql2 =
      "UPDATE `task` SET `Status`='En cours' WHERE `Id_tache`='" +
      Id_tache +
      "'";
    db.query(sql2, (err, result2) => {
      if (err) {
        console.log("Error", err);
        return res.status(500).send(JSON.stringify({ err: err.message }));
      }
      return res
        .status(200)
        .send(JSON.stringify({ message: "Validation", result: result2[0] }));
    });
  });
});

app.get("/api/all-notification", (req, res) => {
  const sql = `select * from notification where is_read='0'`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send(JSON.stringify({ error: "get problem" }));
    }
    return res.status(200).send(
      JSON.stringify({
        count: result.length,
        message: true,
        result: result,
      })
    );
  });
});

app.post("/api/set-read", (req, res) => {
  const Id_not = req.body.Id_not;
  const sql =
    "update notification set is_read=1 where `Id_not`='" + Id_not + "'";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send(JSON.stringify({ message: false, err: err.message }));
    }
    return res.status(200).send(JSON.stringify({ message: true }));
  });
});



// Start server
server.listen(3000, () => {
  console.log("Serveur backend démarré sur le port 3000");
});
