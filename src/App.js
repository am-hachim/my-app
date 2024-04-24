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

const MyLocationMarker = ({ setCurrentPosition }) => {
  const map = useMap();

  useEffect(() => {
    // Déclenche immédiatement une localisation au montage du composant
    map.locate({ setView: false, maxZoom: 50 });

    // Ensuite, continue avec un intervalle régulier
    const locateInterval = setInterval(() => {
      map.locate({ setView: false, maxZoom: 50 });
    }, 500); // Mise à jour toutes les secondes
    
    // Fonction de nettoyage pour arrêter l'intervalle lors du démontage du composant
    return () => clearInterval(locateInterval);
  }, [map]);

  useMapEvents({
    locationfound(e) {
      const newPosition = e.latlng;
      setCurrentPosition(newPosition); // Met à jour l'état avec la position actuelle
      map.flyTo(newPosition, map.getZoom());
    },
    locationerror(e) {
      console.error('Location error:', e.message);
    }
  });

  return null; // Ce composant ne rend rien visuellement
};

const LocationUpdater = ({ setGeolocation }) => {
  const map = useMap();

  useEffect(() => {
    // Déclenche immédiatement une localisation au montage du composant
    map.locate({ setView: false, maxZoom: map.getZoom() });

    // Ensuite, continue avec un intervalle régulier
    const locateInterval = setInterval(() => {
      map.locate({ setView: true, maxZoom: 50 });
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
  const [currentPosition, setCurrentPosition] = useState([51.505, -0.09]);
  const [geolocation, setGeolocation] = useState([])
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

  // const position = [51.505, -0.09]
  // Fonction pour envoyer des notifications toutes les 30 secondes
  useEffect(() => {
    let notificationInterval;
    if (running) {
      notificationInterval = setInterval(() => {
        if (Notification.permission === 'granted') {
          new Notification('Mise à jour de la position');
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Mise à jour de la position');
            }
          });
        }
      }, 300);
    }
    return () => clearInterval(notificationInterval);
  }, [running]);



  return (
    <div className="dictaphone-container">
      <button className="microphone-status" onClick={toggleMicrophone}>
        <img src={listening ? microphoneOn : microphoneOff} alt="Microphone" />
      </button>
      <p className="response">Réponse : {message}</p>
      <p className="chrono">{formatTime(secondsElapsed)}</p>
      <div style={{ display: 'grid', justifyContent: 'center', alignItems: 'center', height: '50vh', marginTop: "20px" }}>
        <MapContainer center={[43.700001, 7.25]} zoom={50} style={{ height: '50vh', width: '70vh' }}>{/*scrollWheelZoom={false}*/}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MyLocationMarker setCurrentPosition={setCurrentPosition} />
          <Marker icon={me} position={currentPosition}>
            <Popup>
            {message}
            </Popup>
          </Marker>
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