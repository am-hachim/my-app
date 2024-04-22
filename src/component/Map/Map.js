import React, { useState } from 'react';

const Map = () => {
  const [map, setMap] = useState(null);

  function getCurrentPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMap({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          console.log("Geolocation: ", map);
          alert("Latitude: " + map.latitude + ", Longitude: " + map.longitude);
        },
        (error) => {
          console.error("Error getting current position:", error);
            alert("ggggg" , error)
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  return (
    <div>
      <button onClick={getCurrentPosition}>Get Loction mon negro</button>
      {/* Afficher la carte si la variable map est définie */}
      {map && (
        <div>
          Latitude: {map.latitude}, Longitude: {map.longitude}
        </div>
      )}
    </div>
  );
};

export default Map;
