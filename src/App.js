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





const LocationUpdater = ({ setGeolocation }) => {
  const map = useMap();

  useEffect(() => {
    const locateInterval = setInterval(() => {
      map.locate({ setView: true, maxZoom: map.getZoom() });
    }, 5000);
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
      command: "fond d'écran *",
      callback: (color) => {
        document.body.style.background = color;
      }
    },
    {
      command: ['Commencer', 'Débuter', 'Démarrer'],
      callback: ({ command }) => {
        setMessage(`Débute de l'itineraire`);
        setIsTracking(true);
      },
      matchInterim: true
    },
    {
      command: ['finir', 'fin', 'arrêter', 'stop', 'terminer'],
      callback: ({ command }) => {
        setMessage(`Fin de l'itineraire`)
        setIsTracking(false);
      },
      matchInterim: true
    },
    {
      command: ['enregistrer', 'save'],
      callback: ({ command }) => setMessage(`Itineraire enregister`),
      matchInterim: true
    },
    {
      command: ['Supprimer', 'remove'],
      callback: ({ command }) => setMessage(`Suppression de l'itinéraire`),
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



  const position = [51.505, -0.09]


  return (
    <div className="dictaphone-container">
      <button className="microphone-status" onClick={toggleMicrophone}>
        <img src={listening ? microphoneOn : microphoneOff} alt="Microphone" />
      </button>
      <p className="response">Réponse : {message}</p>
      <div style={{ display: 'grid', justifyContent: 'center', alignItems: 'center', height: '50vh', marginTop: "20px" }}>
        <MapContainer center={{ lat: 50.1109, lng: 0.1313 }} zoom={6} style={{ height: '50vh', width: '70vh' }}>{/*scrollWheelZoom={false}*/}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker icon={marker} position={position}>
            {/* <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup> */}
          </Marker>
          {isTracking && <LocationUpdater setGeolocation={setGeolocation} />}
          <Polyline positions={geolocation}></Polyline>
        </MapContainer>,
      </div>
    </div>
  );
};
export default App;