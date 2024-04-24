import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css';

// Assuming your images are in the public folder, you can refer to them like this
import microphoneOn from './microphone-on.png';
import microphoneOff from './microphone-off.png';

import { MapContainer, TileLayer, useMapEvents, useMap, Marker, Popup, Polyline } from 'react-leaflet'
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.1/dist/leaflet.css" />

const marker = new L.Icon({
  iconUrl: require("./marker.png"),
  iconSize: [30, 35],
  iconAnchor: [15, 37],
  popupAnchor: [0, -37],
})

const me = new L.Icon({
  iconUrl: require("./me.png"),
  iconSize: [8, 8]
})


const MyLocationMarker = () => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const watchID = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
      },
      (err) => {
        console.error(err);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchID);
    };
  }, []);

  return position ? (
    <Marker icon={me} position={position} />
  ) : null;
};

const LocationUpdater = ({ setGeolocation }) => {
  const map = useMap();

  useEffect(() => {
    // Déclenche immédiatement une localisation au montage du composant
    map.locate({ setView: true, maxZoom: map.getZoom() });

    // Ensuite, continue avec un intervalle régulier
    const locateInterval = setInterval(() => {
      map.locate({ setView: true, maxZoom: map.getZoom() });
    }, 1000);
    
    // Fonction de nettoyage pour arrêter l'intervalle lors du démontage du composant
    return () => clearInterval(locateInterval);
  }, [map]);

  useMapEvents({
    locationfound(e) {
      const newPosition = e.latlng;
      setGeolocation(prevPositions => [...prevPositions, newPosition]);
      if (map) map.flyTo(newPosition, map.getZoom());
    },
    locationerror(e) {
      console.error('Location error:', e.message);
    }
  });

  return null;
};


const App = () => {
  
  const [geolocation, setGeolocation] = useState([
    [51.505, -0.09],
    [50.633333, 3.066667],
    [48.8534951, 2.3483915]]
  )
  const [isTracking, setIsTracking] = useState(false);
  const [startPosition, setStartPosition] = useState(null);
  const [lastPosition, setLastPosition] = useState(null);

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setSecondsElapsed(prevSeconds => prevSeconds + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleMicrophone = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
    } else {
      startListening();
    }
  };

  const [message, setMessage] = useState('')

  const commands = [
    {
      command: ['Commencer', 'Débuter', 'Démarrer'],
      callback: ({ command }) => {
        setMessage(`Débute de l'itineraire`);

        setRunning(true);
        setIsTracking(true);
        if (!startPosition && geolocation.length > 0) { // Assurez-vous que geolocation est mis à jour avant
          setStartPosition(geolocation[geolocation.length - 1]);
        }
      },
      matchInterim: true
    },
    {
      command: ['finir', 'fin', 'arrêter', 'stop', 'terminer'],
      callback: ({ command }) => {
        setMessage(`Fin de l'itineraire`);

        setRunning(false);
        setIsTracking(false);
        if (geolocation.length > 0) {
          setLastPosition(geolocation[geolocation.length - 1]); // Enregistre la dernière position connue
        }
      },
      matchInterim: true
    },
    {
      command: ['enregistrer', 'save'],
      callback: ({ command }) => {
        setMessage(`Itineraire enregister`);
        
        setSecondsElapsed(0);
        setRunning(false);
        setGeolocation([]);
        setStartPosition(null);
        setLastPosition(null);
      },
      matchInterim: true
    },
    {
      command: ['Supprimer', 'remove'],
      callback: ({ command }) => {
        setMessage(`Suppression de l'itinéraire`);
        
        setSecondsElapsed(0);
        setRunning(false);
        setGeolocation([]);
        setStartPosition(null)
        setLastPosition(null);
      },
      matchInterim: true
    }
  ]

  const {
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({ commands });

  const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'fr-FR' });

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }


  // const map = useMap();
  // map.locate({ setView: true, maxZoom: map.getZoom() });
  // const position = [51.505, -0.09]


  return (
    <div className="dictaphone-container">
      <button className="microphone-status" onClick={toggleMicrophone}>
        <img src={listening ? microphoneOn : microphoneOff} alt="Microphone" />
      </button>
      <p className="response">Réponse : {message}</p>
      <p className="chrono">{formatTime(secondsElapsed)}</p>
      <div style={{ display: 'grid', justifyContent: 'center', alignItems: 'center', height: '50vh', marginTop: "20px" }}>
        <MapContainer center={{ lat: 50.1109, lng: 0.1313 }} zoom={20} style={{ height: '50vh', width: '70vh' }}>{/*scrollWheelZoom={false}*/}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MyLocationMarker />
          {startPosition && (
            <Marker icon={marker} position={startPosition}>
              <Popup>
                Début de l'itineraire
              </Popup>
            </Marker>
          )}
          {isTracking && <LocationUpdater setGeolocation={setGeolocation} />}
          {geolocation && <Polyline positions={geolocation}></Polyline>}
          {lastPosition && !isTracking && (
            <Marker icon={marker} position={lastPosition}>
              <Popup>
                Fin de l'itineraire
              </Popup>
            </Marker>
          )}
        </MapContainer>,
      </div>
    </div>
  );
};
export default App;