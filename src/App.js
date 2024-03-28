import React , { useEffect }from 'react';
import logo from './logo.svg';
import './App.css';
import { scheduleHandWashNotification } from './NotificationManager'; // Import du gestionnaire de notifications
import Notification from './NotificationManager';
// import requestForToken from './firebaseNotification/firebase'
function App() {
  // useEffect(() => {
  //   requestForToken();
  //   // scheduleHandWashNotification(); // Appel pour planifier les notifications de lavage des mains
  // }, []); // Utilisation de useEffect pour s'assurer que cela ne se produit qu'une seule fois

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
           atatata
        </a>
      </header>
    </div>
  );
}

export default App;
