import React from "react";
import "../styles/Navigation.scss";

function Navigation({ game, setGame }) {
  return (
    <div className="nav">
      <div className="nav_logo">
        <a href="/">
          <img src="/images/final.png" alt="logo" />
        </a>
      </div>
      {game && (
        <>
          <h1>Punkty: {game.totalScore}</h1>
          <button
            className="nav_leaveGame"
            onClick={(e) => {
              setGame(null);
            }}
          >
            Wyjdź z gry
          </button>
        </>
      )}
    </div>
  );
}
export default Navigation;
