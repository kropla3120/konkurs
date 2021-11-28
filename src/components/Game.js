import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore/lite";
import { GoogleMap, useJsApiLoader, StreetViewPanorama, Marker, Polyline } from "@react-google-maps/api";
import markerLocation from "../images/markerLocation.png";
import markerGuess from "../images/markerGuess.png";
import tippy from "tippy.js";

import "tippy.js/dist/tippy.css";
import "../styles/Game.scss";

export default function Game({ game: gameStatus, setGame: setGameStatus, db }) {
  const [game, setGame] = useState(gameStatus);
  const [roundSummary, setRoundSummary] = useState(null);
  const [streetView, setStreetView] = useState(null);
  const [gameSummary, setGameSummary] = useState({ rounds: [], summaryScreen: false });
  const [gameReload, setGameReload] = useState(null);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCJKJsgS2XTO9MX7uhSvthiuxe3fYJrRf8",
  });
  const containerStyle = {
    width: "100%",
    height: "100%",
  };
  const onLoad = useCallback(
    function callback(map) {
      const bounds = new window.google.maps.LatLngBounds();
      map.fitBounds(bounds);
      setGame({ ...game, map: map });
    },
    [setGame, game]
  );
  const onLoadGuess = useCallback(
    function callback(map) {
      map.setCenter({ lat: 53.8632402, lng: 20.3740641 });
      setGame({ ...game, map: map });
    },
    [setGame, game]
  );
  const onLoadStreetView = useCallback(
    function callback(sv) {
      sv.setPosition(game.locations[game.currentLocation].geo);
      setStreetView(sv);
    },
    [game]
  );
  const onUnmount = useCallback(
    function callback(map) {
      setGame({ ...game, map: null });
    },
    [setGame, game]
  );

  useEffect(
    () => {
      const fetchData = async () => {
        const data = await getDocs(collection(db, "maps", game.mode, "locations")); //pobieranie wszystkich lokaliazcji z bazy danych dla danego trybu gry
        return data._docs.map((location) => {
          return location.data();
        });
      };
      fetchData().then((locationsArr) => {
        let randomLocations = [];
        for (let i = 0; i < 5; i++) {
          //losowanie 5 lokalizacji
          let randomLocation = Math.floor(Math.random() * locationsArr.length);
          if (randomLocations.includes(locationsArr[randomLocation])) {
            i--; //jesli juz wylosowalismy taka sama lokalizacje to losujemy jeszcze raz
          } else {
            randomLocations.push(locationsArr[randomLocation]);
          }
        }
        // console.log(randomLocations);
        setGameStatus({ ...gameStatus, totalScore: 0 });
        setGame({ ...game, locations: randomLocations, currentLocation: 0 });
        setGameReload(false);
      });
    },
    // eslint-disable-next-line
    [gameReload]
  );

  const calculateDistance = (coords1, coords2) => {
    function toRad(x) {
      //konwersja stopni na radiany
      return (x * Math.PI) / 180;
    }
    var R = 6371; // promień ziemi w km
    var dLatRad = toRad(coords2.lat - coords1.lat); //delta dlugosci geograficznej w radianach
    var dLonRad = toRad(coords2.lng - coords1.lng); //delta szerokosci geografiicznej w radianach
    var a = Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) + Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) * Math.sin(dLonRad / 2) * Math.sin(dLonRad / 2); //formula haversine
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; //obliczanie odleglosci w km
    return d;
  };

  const guessHandle = () => {
    if (game.guess) {
      let locationGeo = game.locations[game.currentLocation].geo;
      let distanceKm = calculateDistance(game.guess, locationGeo);
      let distanceM = distanceKm * 1000;
      let points;
      if (distanceM < 500) {
        //jesli odleglosc jest mniejsza od 500m to dostajemy max punkty
        points = 1000;
      } else {
        points = Math.round((22 / Math.sqrt(distanceM)) * 1000);
      }
      let point1 = new window.google.maps.LatLng(game.guess.lat, game.guess.lng); //konwersja punktu do google maps
      let point2 = new window.google.maps.LatLng(locationGeo.lat, locationGeo.lng); //konwersja punktu do google maps
      let bounds;
      bounds = new window.google.maps.LatLngBounds(point1, point2);

      function latRad(lat) {
        var sin = Math.sin((lat * Math.PI) / 180); //konwersja stopni na radiany
        var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
      }

      function getZoom(lat_a, lng_a, lat_b, lng_b) {
        //funkcja obliczająca jak bardzo ma byc przyblizona mapa tak aby zmiescily sie na ekranie dwa punkty
        let latDif = Math.abs(latRad(lat_a) - latRad(lat_b));
        let lngDif = Math.abs(lng_a - lng_b);

        let latFrac = latDif / Math.PI;
        let lngFrac = lngDif / 360;

        let lngZoom = Math.log(1 / latFrac) / Math.log(2);
        let latZoom = Math.log(1 / lngFrac) / Math.log(2);

        return Math.round(Math.min(lngZoom, latZoom));
      }
      function getCenter(point1, point2) {
        let lat = (point1.lat + point2.lat) / 2; //obliczanie srodka miedzy dwoma punktami
        let lng = (point1.lng + point2.lng) / 2;

        return { lat: lat, lng: lng };
      }

      setRoundSummary({
        //obiekt zawierajacy informacje o wyniku rundy
        distance: distanceKm > 1 ? distanceKm.toFixed(2) + " km" : distanceM.toFixed(2) + " m",
        points: points,
        center: getCenter(game.guess, locationGeo),
        guess: game.guess,
        location: game.locations[game.currentLocation],
        bounds: bounds,
        zoom: getZoom(game.guess.lat, game.guess.lng, locationGeo.lat, locationGeo.lng) + 1,
        final: game.currentLocation === 4 ? true : false,
      });
      setGameStatus({ ...gameStatus, totalScore: gameStatus.totalScore + points });
      setGameSummary({ ...gameSummary, rounds: gameSummary.rounds.concat({ guess: game.guess, location: locationGeo }) }); //dodanie wyniku rundy do obiektu zawierajacego podsumowanie gry
    }
  };
  if (isLoaded && game.locations?.length > 0) {
    //jesli dane sa zaladowane wyswietlamy gre
    if (roundSummary) {
      if (gameSummary.summaryScreen) {
        //ekran podsumowania calej gry
        return (
          <GoogleMap mapContainerStyle={containerStyle} center={{ lat: 53.8632402, lng: 20.3740641 }} zoom={8} options={{ disableDefaultUI: true }} onUnmount={onUnmount}>
            {gameSummary.rounds.map((round, index) => {
              return (
                <>
                  <Marker key={index + "guess"} position={round.guess} icon={{ url: markerGuess, scaledSize: new window.google.maps.Size(50, 50) }} />
                  <Marker key={index + "location"} position={round.location} icon={{ url: markerLocation, scaledSize: new window.google.maps.Size(50, 50) }} />
                  <Polyline key={index + "line"} path={[round.guess, round.location]} />
                </>
              );
            })}
            <div className="game_roundSummary" style={{ height: "auto" }}>
              <div>
                <h1 className="game_roundSummary_points">
                  Gratulacje!
                  <br /> Zdobyłeś <b>{gameStatus.totalScore}</b> punktów!
                </h1>
              </div>
              <button
                className="btn"
                style={{ padding: "1rem" }}
                onClick={() => {
                  setGameStatus({ ...gameStatus, totalScore: 0 });
                  setGame({ mode: game.mode });
                  setGameSummary({ rounds: [], summaryScreen: false });
                  setRoundSummary(null);
                  setGameReload(true);
                }}
              >
                Następna gra ?
              </button>
            </div>
          </GoogleMap>
        );
      } else {
        //ekran podsumowania rundy
        return (
          <GoogleMap mapContainerStyle={containerStyle} center={roundSummary.center} zoom={roundSummary.zoom} options={{ disableDefaultUI: true }} onUnmount={onUnmount}>
            <>
              <Marker position={roundSummary.guess} icon={{ url: markerGuess, scaledSize: new window.google.maps.Size(50, 50) }} />
              <Marker position={roundSummary.location.geo} icon={{ url: markerLocation, scaledSize: new window.google.maps.Size(50, 50) }} />
              <Polyline path={[roundSummary.guess, roundSummary.location.geo]} options={{ strokeColor: "#17171c", strokeOpacity: "0.8", strokeWeight: "2" }} />
            </>
            <div className="game_roundSummary">
              <div>
                <h1 className="game_roundSummary_distance">
                  Odległość: <b>{roundSummary.distance} </b>
                </h1>
                <h1 className="game_roundSummary_points">
                  Punkty: <b>{roundSummary.points}</b>
                </h1>
                <h1>Fakty:</h1>
                <p>{roundSummary.location.desc}</p>
              </div>
              {roundSummary.final ? (
                <button
                  className="btn"
                  onClick={() => {
                    setGameSummary({ ...gameSummary, summaryScreen: true });
                  }}
                  style={{ padding: "1rem" }}
                >
                  Podsumowanie
                </button>
              ) : (
                <button
                  className="btn"
                  onClick={() => {
                    if (game.currentLocation < 5) {
                      setGame({ ...game, currentLocation: game.currentLocation + 1, guess: null });
                      setRoundSummary(null);
                    }
                  }}
                  style={{ padding: "1rem" }}
                >
                  Następna lokalizacja!
                </button>
              )}
            </div>
          </GoogleMap>
        );
      }
    } else {
      tippy("#return", {
        content: "Wróć do pierwotnej lokalizacji",
        placement: "right",
      });
      //ekran gry
      return (
        <GoogleMap mapContainerStyle={containerStyle} onLoad={onLoad}>
          <StreetViewPanorama
            visible={true}
            options={{
              disableDefaultUI: true, //zablokowanie ustawień mapy
              panControl: true, //pokazanie kompasu w lewym gornym rogu
              panControlOptions: {
                position: window.google.maps.ControlPosition.TOP_LEFT,
              },
              enableCloseButton: false,
              showRoadLabels: false,
              position: game.locations[game.currentLocation].geo,
            }}
            onLoad={onLoadStreetView}
          />
          <div className="game_controls">
            <button
              className="btn"
              id="return"
              onClick={() => {
                streetView.setPosition(game.locations[game.currentLocation].geo);
              }}
            >
              <ion-icon name="flag"></ion-icon>
            </button>
          </div>
          <div className="game_guessDiv">
            <GoogleMap
              onClick={(e) => {
                setGame({ ...game, guess: { lat: e.latLng.lat(), lng: e.latLng.lng() } });
              }}
              clickableIcons={false}
              options={{
                disableDefaultUI: true,
              }}
              mapContainerStyle={{ width: "100%", height: "calc(100% - 4rem)", borderRadius: "0.5rem" }}
              zoom={7.1}
              onLoad={onLoadGuess}
              // onUnmount={onUnmount}
            >
              {game.guess && <Marker position={game.guess} icon={{ url: markerGuess, scaledSize: new window.google.maps.Size(50, 50) }} />}
            </GoogleMap>
            <button
              className={game.guess ? "game_guessBtn btn" : "game_guessBtn game_guessBtn_disabled btn"} //jesli nie wybrano punktu to przycisk jest nieaktywny
              onClick={() => {
                guessHandle();
              }}
            >
              Zgadnij
            </button>
          </div>
        </GoogleMap>
      );
    }
  } else return <></>;
}
