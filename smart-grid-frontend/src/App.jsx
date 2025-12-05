import { useState } from "react";

export default function App() {
  const [battery, setBattery] = useState(85);

  const zones = [
    { name: "Salon", icon: "🛋️", currentMax: "10A", voltageMax: "220V" },
    { name: "Cuisine", icon: "🍽️", currentMax: "15A", voltageMax: "220V" },
    { name: "Chambre", icon: "🛏️", currentMax: "8A", voltageMax: "220V" },
    { name: "Garage", icon: "🚗", currentMax: "12A", voltageMax: "220V" },
  ];

  const getAllowedZones = () => {
    if (battery >= 60) return 4;
    if (battery >= 40) return 3;
    if (battery >= 30) return 2;
    return 1;
  };

  const allowed = getAllowedZones();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Batterie section */}
      <div className="max-w-xl mx-auto bg-white p-4 rounded-xl shadow mb-6">
        <h1 className="text-xl font-bold mb-2 text-gray-700">État de la Batterie</h1>
        <div className="h-6 w-full bg-gray-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${battery}%` }}
          ></div>
        </div>
        <p className="mt-2 text-gray-600 font-semibold">{battery}% restant</p>

        {/* Modifier batterie */}
        <div className="flex gap-2 mt-3">
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => setBattery((b) => Math.min(100, b + 10))}>
            +10%
          </button>
          <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => setBattery((b) => Math.max(0, b - 10))}>
            -10%
          </button>
        </div>

        {/* Règles */}
        <p className="mt-3 text-sm text-gray-500">
          Zones actives autorisées : <b>{allowed}</b>
        </p>
      </div>

      {/* Zones */}
      <div className="max-w-xl mx-auto grid grid-cols-2 gap-4">
        {zones.map((zone, index) => (
          <div
            key={zone.name}
            className={`p-4 rounded-xl shadow bg-white flex flex-col items-center
              ${index < allowed ? "opacity-100" : "opacity-40 pointer-events-none"}
            `}
          >
            <div className="text-4xl">{zone.icon}</div>
            <h2 className="mt-2 text-lg font-bold">{zone.name}</h2>
            <p className="text-sm text-gray-600">Courant max : {zone.currentMax}</p>
            <p className="text-sm text-gray-600">Tension max : {zone.voltageMax}</p>

            <button
              className="mt-3 bg-indigo-600 text-white px-4 py-1 rounded shadow"
              onClick={() => alert(`Ouverture des appareils dans ${zone.name}`)}
            >
              Voir appareils
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
