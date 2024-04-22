import React, { useState } from 'react';

const Map = () => {
  const [map, setMap] = useState(null);

  function getCurrentPosition() {
    if (navigator.geolocation) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then(function (result) {
          if (result.state === "granted") {
            // If permission is already granted, get the current position
            navigator.geolocation.getCurrentPosition(success, error);
          } else if (result.state === "prompt") {
            // If permission is not yet granted, request permission and then get the current position
            navigator.geolocation.getCurrentPosition(success, error);
          } else if (result.state === "denied") {
            // If permission is denied, handle accordingly
            console.error("Permission to access location was denied");
          }
        });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  
    function success(position) {
      setMap({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      console.log("Geolocation: ", map);
      alert("Latitude: " + map.latitude + ", Longitude: " + map.longitude);
    }
  
    function error(err) {
      console.error("Error getting current position:", err);
      alert("ggggg", err);
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
