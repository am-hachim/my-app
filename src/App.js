import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css';
import Cookies from 'js-cookie';

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
  iconSize: [7, 7]
})

const MyLocationMarker = ({ setCurrentPosition }) => {
  const map = useMap();

  useEffect(() => {
    // Déclenche immédiatement une localisation au montage du composant
    map.locate({ setView: true, maxZoom: 50 });

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
    map.locate({ setView: false, maxZoom: 50 });

    // Ensuite, continue avec un intervalle régulier
    const locateInterval = setInterval(() => {
      map.locate({ setView: false, maxZoom: 50 });
    }, 1000);
    
    // Fonction de nettoyage pour arrêter l'intervalle lors du démontage du composant
    return () => clearInterval(locateInterval);
  }, [map]);

  useMapEvents({
    locationfound(e) {
      const newPosition = e.latlng;
      setGeolocation(prevPositions => [...prevPositions, newPosition]);
      
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
          setStartPosition(geolocation[0]);
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
      command: "Ouvrir trajet *",
      callback: (trajet) => {
        setMessage(`Ouvrir trajet ${trajet}`);
        // Récupérer les trajets existants du cookie
        const allTrajets = Cookies.get('geolocations') ? JSON.parse(Cookies.get('geolocations')) : [];
        const trajettest = `Trajet ${trajet}`;
        console.log(trajettest)
        // Trouver le trajet spécifique "Trajet 0"
        const trajettouvé = allTrajets.find(trajet => trajet.name === trajettest);

        if (trajettouvé) {
          // Mettre à jour `geolocation` avec les coordonnées de "Trajet 0"
          setGeolocation(trajettouvé.coordinates);
        } else {
          // S'il n'y a pas de "Trajet 0", peut-être initialiser à vide ou gérer l'erreur
          setGeolocation([]);
          setMessage(`Trajet ${trajet} non trouvé`);
        }
      },
      matchInterim: true
    },
    {
      command: ['enregistrer *', 'save *'],
      callback: (trajet) => {
        setMessage(`Itineraire ${trajet} enregister`);
        const trajetName = `Trajet ${trajet}`;
        // Récupérer les trajets existants ou initialiser un tableau vide
        const existingGeolocations = Cookies.get('geolocations') ? JSON.parse(Cookies.get('geolocations')) : [];

        // Vérifier si le trajet existe déjà
        const trajetExists = existingGeolocations.some(trajet => trajet.name === trajetName);


        // Créer un nouveau trajet avec les données actuelles de geolocation
        if (!trajetExists) {
          // Créer un nouveau trajet avec les données actuelles de geolocation
          const newTrajet = {
            name: trajetName,
            coordinates: geolocation
          };
    
          // Ajouter le nouveau trajet aux trajets existants
          const updatedGeolocations = [...existingGeolocations, newTrajet];
    
          // Enregistrer le tableau mis à jour dans les cookies
          Cookies.set('geolocations', JSON.stringify(updatedGeolocations)); // Le cookie expire après 7 jours
    
          setMessage(`Itineraire ${trajetName} enregistré`);
        } else {
          setMessage(`Itineraire ${trajetName} existe déjà. Enregistrement annulé.`);
        }

        // const trajet1 = {
        //   name: `Trajet 1`,
        //   coordinates: [
        //     [51.505, -0.09],
        //     [50.633333, 3.066667],
        //     [48.8534951, 2.3483915],
        //     [43.628644, 7.117534],
        //     [43.620883, 7.118732]
        //   ]
        // };

        // Ajouter le nouveau trajet aux trajets existants
        // const updatedGeolocations = [...existingGeolocations, trajet1];
        // Cookies.set('geolocations', JSON.stringify(updatedGeolocations)); // Le cookie expire après 7 jours


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

  return (
    <div className="dictaphone-container">
      <button className="microphone-status" onClick={toggleMicrophone}>
        <img src={listening ? microphoneOn : microphoneOff} alt="Microphone" />
      </button>
      <p className="response">Réponse : {message}</p>
      <p className="chrono">{formatTime(secondsElapsed)}</p>
      <div style={{ width: '100%', height: '50vh', marginTop: "20px", marginLeft: "10%", marginRight: "10%" }}>        
        <MapContainer center={[43.700001, 7.25]} zoom={20} style={{ height: '100%', width: '100%' }}>{/*scrollWheelZoom={false}*/}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {startPosition && isTracking && (
            <Marker icon={marker} position={startPosition}>
              <Popup>
              Début de l'itineraire
              </Popup>
            </Marker>
          )}
          <MyLocationMarker setCurrentPosition={setCurrentPosition} />
          <Marker icon={me} position={currentPosition}></Marker>

          {isTracking && <LocationUpdater setGeolocation={setGeolocation} />}
          <Polyline positions={geolocation}></Polyline>

          {lastPosition && !isTracking && (
            <Marker icon={marker} position={lastPosition}>
              <Popup>
                Fin de l'itineraire
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};
export default App;