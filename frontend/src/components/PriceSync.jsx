import { useState } from "react";
import axios from "axios";
import "./PriceSync.css";

export default function PriceSync() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("EE");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const validateInputs = () => {
    if (!start) {
      setMessage({ text: "Palun vali alguskellaaeg.", type: "error" });
      return false;
    }
    if (!end) {
      setMessage({ text: "Palun vali lõppkellaaeg.", type: "error" });
      return false;
    }
    if (new Date(start) >= new Date(end)) {
      setMessage({ text: "Alguskellaaeg peab olema enne lõppkellaaja.", type: "error" });
      return false;
    }
    return true;
  };

  const handleSync = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await axios.post("http://localhost:3001/api/sync/prices", {
        start,
        end,
        location
      });
      setMessage({
        text: `Hinnad sünkrooniti edukalt! Lisatud: ${res.data.inserted}, uuendatud: ${res.data.updated}`,
        type: "success"
      });
      // Clear form after success
      setStart("");
      setEnd("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Sünkroonimine ebaõnnestus. Palun proovi hiljem.";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="price-sync-container">
      <h2>Elektrihindade sünkroonimine</h2>
      
      <div className="form-group">
        <label htmlFor="start-time">Alguskellaaeg (UTC)</label>
        <input
          id="start-time"
          type="datetime-local"
          value={start}
          onChange={e => setStart(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="end-time">Lõppkellaaeg (UTC)</label>
        <input
          id="end-time"
          type="datetime-local"
          value={end}
          onChange={e => setEnd(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Piirkond</label>
        <select
          id="location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          disabled={loading}
        >
          <option value="EE">Eesti (EE)</option>
          <option value="LV">Läti (LV)</option>
          <option value="FI">Soome (FI)</option>
        </select>
      </div>

      <button
        onClick={handleSync}
        disabled={loading}
        className={`price-sync-button ${loading ? "loading" : "default"}`}
      >
        {loading ? "Laadamine..." : "Sünkroonimine"}
      </button>

      {message.text && (
        <div className={`price-sync-message ${message.type}`}>
          {message.type === "success" && "✓ "}
          {message.type === "error" && "✗ "}
          {message.text}
        </div>
      )}
    </div>
  );
}