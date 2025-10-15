import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com"
});

// Example: create a custom token for your front-end
app.post("/login", async (req, res) => {
  const uid = req.body.uid;
  const token = await admin.auth().createCustomToken(uid);
  res.json({ token });
});
