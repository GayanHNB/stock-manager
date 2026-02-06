const express = require('express');
const cors = require('cors'); // ✅ මේක අලුතෙන් දැම්මා
const admin = require('firebase-admin');

const serviceAccount = require('/etc/secrets/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors()); // ✅ Netlify එකට එන්න අවසර දුන්නා
app.use(express.json());

// Add Item
app.post('/api/items', async (req, res) => {
  try {
    const newItem = {
      name: req.body.name,
      qty: req.body.qty,
      price: req.body.price
    };
    const docRef = await db.collection('items').add(newItem);
    res.status(200).send({ id: docRef.id, ...newItem });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get Items
app.get('/api/items', async (req, res) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(items);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Delete Item
app.delete('/api/items/:id', async (req, res) => {
  try {
    await db.collection('items').doc(req.params.id).delete();
    res.status(200).send('Deleted');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});