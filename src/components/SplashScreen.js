import React from "react";
import "../styles/SplashScreen.scss";

export default function SplashScreen({ setGame }) {
  return (
    <div className="splash_container">
      <h1 style={{ color: "white", fontSize: "3rem", fontWeight: "300" }}>Wybierz tryb gry</h1>
      <div className="splash_modes">
        <div className="splash_mode">
          <figure className="splash_figure">
            <img src="/images/splash_miasta.jpg" alt="mode_miasta" />
            <button
              className="btn"
              onClick={(e) => {
                setGame({ mode: "cities" });
              }}
            >
              <h1>Miasta</h1>
            </button>
          </figure>
        </div>
        <div className="splash_mode">
          <figure className="splash_figure">
            <img src="/images/splash_krajobrazy.jpg" alt="mode_krajobrazy" />
            <button
              className="btn"
              onClick={(e) => {
                setGame({ mode: "sights" });
              }}
            >
              <h1>Krajobrazy</h1>
            </button>
          </figure>
        </div>
        <div className="splash_mode">
          <figure className="splash_figure">
            <img src="/images/splash_zabytki.jpg" alt="mode_zabytki" />
            <button
              className="btn"
              onClick={(e) => {
                setGame({ mode: "monuments" });
              }}
            >
              <h1>Zabytki</h1>
            </button>
          </figure>
        </div>
      </div>
    </div>
  );
}
