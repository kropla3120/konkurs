import React, { useState } from "react";
import Navigation from "./Navigation";
import SplashScreen from "./SplashScreen";
import Game from "./Game";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";

import "normalize.css";
import "../styles/App.scss";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpMAnd5dj83ySFO8KgTTU43GVvBE9SzOc",
  authDomain: "wmguessr.web.app",
  projectId: "wmguessr",
  storageBucket: "wmguessr.appspot.com",
  messagingSenderId: "222770451102",
  appId: "1:222770451102:web:dc0abc1c0ef6f41d76218f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  let [game, setGame] = useState(false);
  return (
    <>
      <Navigation game={game} setGame={setGame} />
      <div style={{ transform: "translateY(6rem)", height: "90vh" }}>{game ? <Game game={game} setGame={setGame} db={db} /> : <SplashScreen setGame={setGame} />}</div>
    </>
  );
}

export default App;
