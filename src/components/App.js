import React, { useEffect, useState } from "react";
import Navigation from "./Navigation";
import SplashScreen from "./SplashScreen";
import Game from "./Game";
import { isMobile } from "react-device-detect";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

import "normalize.css";
import "../styles/App.scss";

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDpMAnd5dj83ySFO8KgTTU43GVvBE9SzOc",
  authDomain: "wmguessr.web.app",
  projectId: "wmguessr",
  storageBucket: "wmguessr.appspot.com",
  messagingSenderId: "222770451102",
  appId: "1:222770451102:web:dc0abc1c0ef6f41d76218f",
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

function App() {
  const [game, setGame] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    signInAnonymously(auth).catch((error) => {
      console.error(error.message);
    });
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(user.uid);
      } else {
        setIsAuthenticated(false);
      }
    });
  });
  return (
    <>
      <Navigation game={game} setGame={setGame} />
      {isMobile ? (
        <div className="mobile-guard">
          <h1>Gra obsługiwana jest tylko na komputerach PC.</h1>
        </div>
      ) : (
        <div style={{ transform: "translateY(6rem)", height: "90vh" }}>{game && isAuthenticated ? <Game game={game} setGame={setGame} db={db} /> : <SplashScreen setGame={setGame} />}</div>
      )}
    </>
  );
}

export default App;
