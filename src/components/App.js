import React, { useEffect, useState } from "react";
import Navigation from "./Navigation";
import LandingPage from "./LandingPage";
import Game from "./Game";
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
    //autoryzacja anonimowa w firebase
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
    <div style={{ height: window.innerHeight }}>
      <Navigation game={game} setGame={setGame} />

      <div style={{ transform: "translateY(10vh)", height: "90%" }}>
        {game && isAuthenticated ? (
          /*jesli autoryzacja zostala uzyskana i uzytkownik wybral tryb gry, ladujemy gre*/
          <Game game={game} setGame={setGame} db={db} />
        ) : (
          // w przeciwnym wypadku ladujemy strone powitalna
          <LandingPage setGame={setGame} />
        )}
      </div>
    </div>
  );
}

export default App;
