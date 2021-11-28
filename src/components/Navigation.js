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
        <div className="nav_gameDiv">
          <h1>
            Punkty: <b>{game.totalScore}</b>
          </h1>
          <button
            className="nav_leaveGame btn"
            onClick={(e) => {
              setGame(null);
            }}
          >
            Wyjdź z gry
          </button>
        </div>
      )}
    </div>
  );
}
export default Navigation;
