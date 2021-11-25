import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, doc } from "firebase/firestore/lite";
import { GoogleMap, useJsApiLoader, StreetViewPanorama, Marker, Polyline } from "@react-google-maps/api";
import "../styles/Game.scss";

export default function Game({ game, setGame, db }) {
  const [roundSummary, setRoundSummary] = useState(null);

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
  const onUnmount = useCallback(
    function callback(map) {
      setGame({ ...game, map: null });
    },
    [setGame, game]
  );

  useEffect(() => {
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
      console.log(randomLocations);
      setGame({ ...game, totalScore: 0, locations: randomLocations, currentLocation: 0 });
    });
  }, []);

  const calculateDistance = (coords1, coords2) => {
    function toRad(x) {
      //konwersja stopni na radiany
      return (x * Math.PI) / 180;
    }
    var R = 6371; // promień ziemi w km
    var x1 = coords2.lat - coords1.lat; //delta lat
    var dLat = toRad(x1); //delta lat w radianach
    var x2 = coords2.lng - coords1.lng; //delta lng
    var dLon = toRad(x2); // delta lon w radianach
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); //obliczanie odleglosci
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
        let latDif = Math.abs(latRad(lat_a) - latRad(lat_b));
        let lngDif = Math.abs(lng_a - lng_b);

        let latFrac = latDif / Math.PI;
        let lngFrac = lngDif / 360;

        let lngZoom = Math.log(1 / latFrac) / Math.log(2);
        let latZoom = Math.log(1 / lngFrac) / Math.log(2);

        return Math.round(Math.min(lngZoom, latZoom));
      }
      function getCenter(point1, point2) {
        let lat = (point1.lat + point2.lat) / 2;
        let lng = (point1.lng + point2.lng) / 2;

        return { lat: lat, lng: lng };
      }

      // console.log(getZoom(guess.lat, guess.lng, locationGeo.lat, locationGeo.lng));
      if (game.currentLocation < 4) {
        setRoundSummary({
          distance: distanceKm > 1 ? distanceKm.toFixed(2) + " km" : distanceM.toFixed(2) + " m",
          points: points,
          center: getCenter(game.guess, locationGeo),
          guess: game.guess,
          location: locationGeo,
          bounds: bounds,
          zoom: getZoom(game.guess.lat, game.guess.lng, locationGeo.lat, locationGeo.lng) + 1,
        });
        setGame({ ...game, totalScore: game.totalScore + points });
      } else {
        console.log("abc");
      }
    }
  };
  if (isLoaded && game.locations?.length > 0) {
    if (roundSummary) {
      return (
        <GoogleMap mapContainerStyle={containerStyle} center={roundSummary.center} zoom={roundSummary.zoom} options={{ disableDefaultUI: true }} onUnmount={onUnmount}>
          <Marker position={roundSummary.guess} />
          <Marker position={roundSummary.location} />
          <Polyline path={[roundSummary.guess, roundSummary.location]} />
          <div className="game_roundSummary">
            <div>
              <h1 className="game_roundSummary_distance">Odległość: {roundSummary.distance}</h1>
              <h1 className="game_roundSummary_points">Punkty: {roundSummary.points}</h1>
            </div>
            <button
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
          </div>
        </GoogleMap>
      );
    } else {
      return (
        <GoogleMap mapContainerStyle={containerStyle} onLoad={onLoad}>
          <StreetViewPanorama
            //   center={locations[0].geo}
            visible={true}
            options={{
              disableDefaultUI: true,
              enableCloseButton: false,
              position: game.locations[game.currentLocation].geo,
            }}
          />
          <div className="game_guessDiv">
            <GoogleMap
              onClick={(e) => {
                setGame({ ...game, guess: { lat: e.latLng.lat(), lng: e.latLng.lng() } });
              }}
              clickableIcons={false}
              options={{
                disableDefaultUI: true,
              }}
              mapContainerStyle={{ width: "100%", height: "80%", borderRadius: "0.5rem" }}
              zoom={7.1}
              onLoad={onLoadGuess}
              // onUnmount={onUnmount}
            >
              {game.guess && <Marker position={game.guess} />}
            </GoogleMap>
            <button
              className={game.guess ? "game_guessBtn" : "game_guessBtn_disabled"} //jesli nie wybrano punktu to przycisk jest nieaktywny
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
