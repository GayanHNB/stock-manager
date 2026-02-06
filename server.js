const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors()); // ඕනෑම තැනක සිට සම්බන්ධ වීමට ඉඩ දෙයි
app.use(express.json());

// Firebase සම්බන්ධ කිරීම
// ඔබේ serviceAccountKey.json ෆයිල් එක ෆෝල්ඩරයේ තිබිය යුතුයි
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// --- API Routes ---

// 1. බඩු ලිස්ට් එක ගැනීම (GET)
app.get('/api/items', async (req, res) => {
    try {
        const snapshot = await db.collection('inventory').get();
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(items);
    } catch (error) {
        res.status(500).send("Error fetching items");
    }
});

// 2. අලුත් බඩු එකතු කිරීම (POST)
app.post('/api/items', async (req, res) => {
    try {
        const newItem = req.body;
        await db.collection('inventory').add(newItem);
        res.json({ message: "Item Added!" });
    } catch (error) {
        res.status(500).send("Error adding item");
    }
});

// 3. බඩු ඉවත් කිරීම (DELETE)
app.delete('/api/items/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await db.collection('inventory').doc(id).delete();
        res.json({ message: "Item Deleted!" });
    } catch (error) {
        res.status(500).send("Error deleting item");
    }
});

// --- Server Start (Cloud Ready) ---
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`Inventory Server running on port ${PORT}`);
});