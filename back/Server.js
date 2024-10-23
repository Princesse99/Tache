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



// variable pour la configuration de passeportjs pour l'authentification
const crypto = require("crypto");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");

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
  const sql = "SELECT * FROM utilisateur WHERE Email = ? AND Mot_Passe = ? AND Role = ?";
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

// nouveau login

// configuration de passeport
passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "matricule",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, matricule, password, done) => {
      // connaitre le rpole depuis req.body
      const role = req.body.role;
      try {
        db.query(
          "SELECT * FROM utilisateur WHERE Matricule = ? AND Mot_Passe = ? AND Role = ?",
          [matricule, password, role],
          (err, resultat) => {
            if (err) return done(err);

            const user = resultat[0];
            if (!user) {
              return done(null, false, {
                message: "Incorrect authentification",
              });
            }

            return done(null, user);
          }
        );
      } catch (e) {
        return done(e);
      }
    }
  )
);
//========================================= api pour login maintenant====================================//////
// creation de token
const jwtsecret = crypto.randomBytes(64).toString("hex");
// pour l'api
app.post("/api/authentification", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json({ message: "Authentication failed" });
    }

    // Token creation
    const token = jwt.sign({ userId: user.ID }, jwtsecret, {
      expiresIn: "24h",
    });

    return res.send({
      message: "Authentication succeeded",
      token: token,
      user: user,
      success: true,
    });
  })(req, res, next);
});

// Passport local strategy without role checking
passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "matricule",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, matricule, password, done) => {
      try {
        db.query(
          "SELECT * FROM utilisateur WHERE Matricule = ? AND Mot_Passe = ?",
          [matricule, password],
          (err, resultat) => {
            if (err) return done(err);

            const user = resultat[0];
            if (!user) {
              return done(null, false, {
                message: "Incorrect authentication",
              });
            }
            return done(null, user); 
          }
        );
      } catch (e) {
        return done(e);
      }
    }
  )
);
// fin authentification

// Vérifier si l'utilisateur administrateur existe
const checkAdmin = () => {
  const sql = "SELECT * FROM utilisateur WHERE Role = 'Admin' LIMIT 1";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error checking admin user:", err);
      return;
    }
    if (results.length === 0) {
      // Créer le compte administrateur par défaut
      const adminSql = "INSERT INTO utilisateur (Nom, Email, Mot_Passe, Role,Matricule) VALUES (?, ?, ?, ?,?)";
      db.query(adminSql, ['Admin', 'admin@example.com', 'adminpassword', 'Admin',58036], (err, result) => {
        if (err) {
          console.error("Error creating admin user:", err);
          return;
        }
        console.log("Compte administrateur créé avec succès");
      });
    }
  });
};

// Appeler la fonction lors du démarrage du serveur
checkAdmin();

// Route pour modifier le mot de passe de l'administrateur
app.put("/api/admin/change-password", (req, res) => {
  const {email, currentPassword, newPassword } = req.body;

  if (!email ||!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required" });
  }

  // Check admin user
  const checkAdminSql = "SELECT * FROM utilisateur WHERE Role = 'Admin' AND Email=?";
  db.query(checkAdminSql,[email], (err, results) => {
    if (err) {
      console.error("Error checking admin user:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    const admin = results[0];

    // Check current password
    if (admin.Mot_Passe !== currentPassword || admin.Email !== email) {
      return res.status(400).json({ error: "Mot de passe actuel est incorrecte" });
    }

    // Update password
    const updatePasswordSql = "UPDATE utilisateur SET Mot_Passe = ? WHERE ID = ?";
    db.query(updatePasswordSql, [newPassword, admin.ID], (err, result) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: "Mot de passe correcte" });
    });
  });
});

app.post("/api/utilisateurs", upload.single("image"), (req, res) => {
  const { nom, email, mot_passe, role, matricule } = req.body;  
  const image = req.file ? `/uploads/${req.file.filename}` : "";

  const sql = "INSERT INTO utilisateur (Nom, Email, Mot_Passe, Image, Role, Matricule) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [nom, email, mot_passe, image, role, matricule], (err, result) => {
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
  const { nom, email, mot_passe, role, matricule } = req.body;  
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

  const sql = "UPDATE utilisateur SET Nom = ?, Email = ?, Mot_Passe = ?, Image = ?, Role = ?, Matricule = ? WHERE ID = ?";
  db.query(sql, [nom, email, mot_passe, image, role, matricule, id], (err, result) => {
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
///============Requete pour les taches=================///
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
app.post("/api/task", (req, res) => {
  const { Titre_tache, Description_tache, Echeance_tache, Date_Fin, assignedUser } = req.body;
  const sql = "INSERT INTO task (Titre_tache, Description_tache, Echeance_tache, Date_Fin, ID) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [Titre_tache, Description_tache, Echeance_tache, Date_Fin, assignedUser], (err, result) => {
    if (err) {
      console.error("Error adding task:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ Id_tache: result.insertId, Titre_tache, Description_tache, Echeance_tache, Date_Fin, assignedUser });
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

  // Supprimer les notifications associées
  const deleteNotificationsSql = "DELETE FROM notification WHERE Id_tache = ?";
  db.query(deleteNotificationsSql, [id], (err) => {
    if (err) {
      console.error("Erreur lors de la suppression des notifications :", err);
      return res.status(500).json({ error: err.message });
    }

    // Supprimer la tâche
    const deleteTaskSql = "DELETE FROM task WHERE Id_tache = ?";
    db.query(deleteTaskSql, [id], (err) => {
      if (err) {
        console.error("Erreur lors de la suppression de la tâche :", err);
        return res.status(500).json({ error: err.message });
      }
      res.status(204).send();
    });
  });
});


app.get("/api/taskCounts", (req, res) => {
  const sql = `
        SELECT
            (SELECT COUNT(*) FROM task) AS totalTaches,
            (SELECT COUNT(*) FROM task WHERE Status = 'En cours') AS tachesEnCours,
            (SELECT COUNT(*) FROM task WHERE Status = 'Terminée') AS tachesTerminees,
            (SELECT COUNT(*) FROM task WHERE Status = 'Nouveau') AS tachesEnAttente
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching task counts:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});
//statistique
app.get("/api/dailyTaskStats", (req, res) => {
  const sql = `
    SELECT
        DATE(Echeance_tache) as date,
        Status,
        COUNT(*) as count
    FROM task
    WHERE DATE(Echeance_tache) = CURDATE()
    GROUP BY Status
    ORDER BY Status ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching daily task stats:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
  
});
//count utilisateur
app.get("/api/tasks/monthly", (req, res) => {
  const minTaskCount = 1; // Set the minimum number of tasks to filter
  const sql = `
    SELECT u.Nom as userName, u.Image as userImage, COUNT(t.Id_tache) as taskCount
    FROM task t
    LEFT JOIN utilisateur u ON t.ID = u.ID
    WHERE MONTH(t.Echeance_tache) = MONTH(CURRENT_DATE())
    AND YEAR(t.Echeance_tache) = YEAR(CURRENT_DATE())
    GROUP BY u.Nom, u.Image
    HAVING COUNT(t.Id_tache) > ?
  `;

  db.query(sql, [minTaskCount], (err, results) => {
    if (err) {
      console.error("Error fetching monthly task counts:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});
// Fetch tasks by status
app.get("/api/tasks/status/:status", (req, res) => {
  const { status } = req.params;
  const sql = "SELECT * FROM task WHERE Status = ?";
  
  db.query(sql, [status], (err, result) => {
    if (err) {
      console.error("Error fetching tasks by status:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});


//notificat
app.post("/api/create-notification", (req, res) => {
  const { Id_tache, tache, utilisateur, date, id_user, status } = req.body;
  let newStatus;
  
  // Determine the new status based on the current status
  if (status === "Nouveau") {
    newStatus = "En cours";
  } else if (status === "En cours") {
    newStatus = "Terminée";
  } else {
    return res.status(400).send({ message: "Cannot update a completed task." });
  }

  const message = `utilisateur ${utilisateur} a exécuté la tâche ${tache} avec status ${newStatus}`;

  const sql = "INSERT INTO `notification`( `message`, `ID`, `Id_tache`) VALUES (?, ?, ?)";
  db.query(sql, [message, id_user, Id_tache], (err, result) => {
    if (err) {
      console.log("Error", err);
      return res.status(500).send({ err: err.message });
    }

    const sql2 = "UPDATE `task` SET `Status` = ? WHERE `Id_tache` = ?";
    db.query(sql2, [newStatus, Id_tache], (err, result2) => {
      if (err) {
        console.log("Error", err);
        return res.status(500).send({ err: err.message });
      }
      return res.status(200).send({ message: "Validation successful", newStatus });
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
  const sql = "UPDATE notification SET is_read=1 WHERE `Id_not`='" + Id_not + "'";

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
app.get("/api/tasks/gantt/:userId", (req, res) => {
  const { userId } = req.params;
  
  const sql = `
    SELECT ID, Titre_tache, Description_tache, Echeance_tache AS start, Date_Fin AS end, Status
    FROM task
    WHERE ID = ?
  `;
  
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching Gantt data:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// Start server
server.listen(3000, () => {
  console.log("Serveur backend démarré sur le port 3000");
});
