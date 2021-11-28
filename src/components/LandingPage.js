import React, { useEffect } from "react";
import { tsParticles } from "tsparticles";
import "../styles/LandingPage.scss";

const LandingPage = ({ setGame }) => {
  useEffect(() => {
    tsParticles.load("tsparticles", {
      fpsLimit: 60,
      background: {
        color: {
          value: "#17171c",
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab",
          },
          resize: true,
        },
      },
      particles: {
        color: {
          value: "#ffffff",
        },
        links: {
          color: "#ffffff",
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
        },
        collisions: {
          enable: true,
        },
        move: {
          direction: "none",
          enable: true,
          outMode: "bounce",
          random: false,
          speed: 2,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            value_area: 800,
          },
          value: 60,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle",
        },
        size: {
          random: true,
          value: 5,
        },
      },
    });
  }, []);
  return (
    <>
      <div id="tsparticles"></div>
      <div className="landing_container">
        <h1 style={{ color: "white", fontSize: "3rem", fontWeight: "300" }}>Wybierz tryb gry</h1>
        <div className="landing_modes">
          <div className="landing_mode">
            <figure className="landing_figure">
              <img src="/images/landing_miasta.jpg" alt="mode_miasta" />
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
          {/* <div className="landing_mode">
            <figure className="landing_figure">
              <img src="/images/landing_krajobrazy.jpg" alt="mode_krajobrazy" />
              <button
                className="btn"
                onClick={(e) => {
                  setGame({ mode: "sights" });
                }}
              >
                <h1>Krajobrazy</h1>
              </button>
            </figure>
          </div> */}
          <div className="landing_mode">
            <figure className="landing_figure">
              <img src="/images/landing_zabytki.jpg" alt="mode_zabytki" />
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
    </>
  );
};
export default React.memo(LandingPage);
