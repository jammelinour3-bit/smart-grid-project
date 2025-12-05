// -------------------------------
// Smart Grid Backend (Express + LowDB)
// -------------------------------

import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const app = express();
app.use(express.json());
app.use(cors());

// -------------------------------
// Database (db.json)
// -------------------------------

const adapter = new JSONFile("db.json");
const db = new Low(adapter, { 
  zones: [], 
  batterie: { niveau: 100 },
  deviceTypes: [
    { type: "TV", icon: "📺", avgConsumption: 150 },
    { type: "Réfrigérateur", icon: "🧊", avgConsumption: 200 },
    { type: "Four", icon: "🔥", avgConsumption: 2000 },
    { type: "Lampe", icon: "💡", avgConsumption: 20 },
    { type: "Climatiseur", icon: "❄️", avgConsumption: 1500 },
    { type: "Machine à laver", icon: "🧺", avgConsumption: 500 },
    { type: "Ordinateur", icon: "💻", avgConsumption: 300 },
    { type: "Chargeur", icon: "🔌", avgConsumption: 50 },
  ]
});

// Charge les données au démarrage
await db.read();
db.data ||= { 
  zones: [], 
  batterie: { niveau: 100 },
  deviceTypes: [
    { type: "TV", icon: "📺", avgConsumption: 150 },
    { type: "Réfrigérateur", icon: "🧊", avgConsumption: 200 },
    { type: "Four", icon: "🔥", avgConsumption: 2000 },
    { type: "Lampe", icon: "💡", avgConsumption: 20 },
    { type: "Climatiseur", icon: "❄️", avgConsumption: 1500 },
    { type: "Machine à laver", icon: "🧺", avgConsumption: 500 },
    { type: "Ordinateur", icon: "💻", avgConsumption: 300 },
    { type: "Chargeur", icon: "🔌", avgConsumption: 50 },
  ]
};

// -------------------------------
// ROUTES
// -------------------------------

// ➤ Obtenir toutes les zones
app.get("/zones", async (req, res) => {
  await db.read();
  res.json(db.data.zones);
});

// ➤ Ajouter une zone
app.post("/zones", async (req, res) => {
  const newZone = {
    id: Date.now(),
    nom: req.body.nom || "Nouvelle zone",
    appareils: []
  };

  db.data.zones.push(newZone);
  await db.write();
  res.json(newZone);
});

// ➤ Supprimer une zone
app.delete("/zones/:id", async (req, res) => {
  const id = Number(req.params.id);
  db.data.zones = db.data.zones.filter(z => z.id !== id);
  await db.write();
  res.json({ message: "Zone supprimée" });
});

// ➤ Ajouter un appareil dans une zone
app.post("/zones/:id/appareils", async (req, res) => {
  const zoneId = Number(req.params.id);

  const appareil = {
    id: Date.now(),
    nom: req.body.nom,
    type: req.body.type || "Appareil",
    etat: false,
    conso: req.body.conso || 10
  };

  const zone = db.data.zones.find(z => z.id === zoneId);
  if (!zone) return res.status(404).json({ error: "Zone non trouvée" });

  zone.appareils.push(appareil);
  await db.write();

  res.json(appareil);
});

// ➤ Mettre à jour l'état d'un appareil (ON/OFF)
app.patch("/zones/:zoneId/appareils/:appId", async (req, res) => {
  const zoneId = Number(req.params.zoneId);
  const appId = Number(req.params.appId);

  const zone = db.data.zones.find(z => z.id === zoneId);
  if (!zone) return res.status(404).json({ error: "Zone non trouvée" });

  const appareil = zone.appareils.find(a => a.id === appId);
  if (!appareil) return res.status(404).json({ error: "Appareil non trouvé" });

  // Mettre à jour l'état si fourni
  if (req.body.etat !== undefined) {
    appareil.etat = req.body.etat;
  }

  await db.write();
  res.json(appareil);
});

// ➤ Supprimer un appareil
app.delete("/zones/:zoneId/appareils/:appId", async (req, res) => {
  const zoneId = Number(req.params.zoneId);
  const appId = Number(req.params.appId);

  const zone = db.data.zones.find(z => z.id === zoneId);
  if (!zone) return res.status(404).json({ error: "Zone non trouvée" });

  zone.appareils = zone.appareils.filter(a => a.id !== appId);
  await db.write();

  res.json({ message: "Appareil supprimé" });
});

// -------------------------------
// BATTERIE
// -------------------------------

// ➤ Obtenir les types d'appareils disponibles
app.get("/device-types", async (req, res) => {
  await db.read();
  res.json(db.data.deviceTypes);
});

// ➤ Obtenir l'état de la batterie
app.get("/batterie", async (req, res) => {
  await db.read();
  res.json(db.data.batterie);
});

// ➤ Modifier le niveau de la batterie
app.post("/batterie", async (req, res) => {
  const { niveau } = req.body;
  db.data.batterie.niveau = niveau;
  await db.write();
  res.json(db.data.batterie);
});

// -------------------------------
// LANCEMENT DU SERVEUR
// -------------------------------

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Smart Grid running on http://localhost:${PORT}`);
});
