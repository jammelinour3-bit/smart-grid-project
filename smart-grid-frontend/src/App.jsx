import { useState } from "react";

export default function App() {
  const [battery, setBattery] = useState(85);
  const [showEnergyDeficitModal, setShowEnergyDeficitModal] = useState(false);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showDeviceFormModal, setShowDeviceFormModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);
  const [zones, setZones] = useState([
    { 
      id: 1,
      name: "Salon", 
      icon: "🛋️", 
      currentMax: "10A", 
      voltageMax: "220V",
      devices: [
        { id: 1, name: "TV Samsung", type: "TV", isOn: true, consumption: 150 },
        { id: 2, name: "Lampe LED", type: "Lampe", isOn: true, consumption: 20 }
      ]
    },
    { 
      id: 2,
      name: "Cuisine", 
      icon: "🍽️", 
      currentMax: "15A", 
      voltageMax: "220V",
      devices: [
        { id: 3, name: "Réfrigérateur", type: "Réfrigérateur", isOn: true, consumption: 200 },
        { id: 4, name: "Four", type: "Four", isOn: false, consumption: 2000 }
      ]
    },
    { 
      id: 3,
      name: "Chambre", 
      icon: "🛏️", 
      currentMax: "8A", 
      voltageMax: "220V",
      devices: [
        { id: 5, name: "Climatiseur", type: "Climatiseur", isOn: true, consumption: 1500 }
      ]
    },
    { 
      id: 4,
      name: "Garage", 
      icon: "🚗", 
      currentMax: "12A", 
      voltageMax: "220V",
      devices: []
    },
  ]);

  // Available device types to choose from
  const availableDeviceTypes = [
    { type: "TV", icon: "📺", avgConsumption: 150 },
    { type: "Réfrigérateur", icon: "🧊", avgConsumption: 200 },
    { type: "Four", icon: "🔥", avgConsumption: 2000 },
    { type: "Lampe", icon: "💡", avgConsumption: 20 },
    { type: "Climatiseur", icon: "❄️", avgConsumption: 1500 },
    { type: "Machine à laver", icon: "🧺", avgConsumption: 500 },
    { type: "Ordinateur", icon: "💻", avgConsumption: 300 },
    { type: "Chargeur", icon: "🔌", avgConsumption: 50 },
  ];

  const getAllowedZones = () => {
    if (battery >= 60) return 4;
    if (battery >= 40) return 3;
    if (battery >= 30) return 2;
    return 1;
  };

  const allowed = getAllowedZones();

  // Get all active devices across all zones
  const getActiveDevices = () => {
    const activeDevices = [];
    zones.forEach(zone => {
      zone.devices.forEach(device => {
        if (device.isOn) {
          activeDevices.push({ ...device, zoneName: zone.name, zoneId: zone.id });
        }
      });
    });
    return activeDevices;
  };

  // Handle battery decrease with user choice
  const handleBatteryDecrease = () => {
    const newBattery = Math.max(0, battery - 10);
    const activeDevices = getActiveDevices();
    
    if (activeDevices.length > 0 && newBattery < battery) {
      setShowEnergyDeficitModal(true);
    } else {
      setBattery(newBattery);
    }
  };

  // Turn off selected device
  const turnOffDevice = (zoneId, deviceId) => {
    setZones(prevZones => 
      prevZones.map(zone => 
        zone.id === zoneId 
          ? {
              ...zone,
              devices: zone.devices.map(device => 
                device.id === deviceId ? { ...device, isOn: false } : device
              )
            }
          : zone
      )
    );
    setBattery(prev => Math.max(0, prev - 10));
    setShowEnergyDeficitModal(false);
  };

  // Cancel energy deficit action
  const cancelEnergyDeficit = () => {
    setShowEnergyDeficitModal(false);
  };

  // Open add device modal
  const openAddDeviceModal = (zone) => {
    setSelectedZone(zone);
    setShowAddDeviceModal(true);
  };

  // Select device type
  const selectDeviceType = (deviceType) => {
    setSelectedDeviceType(deviceType);
    setShowAddDeviceModal(false);
    setShowDeviceFormModal(true);
  };

  // Add new device
  const addDevice = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newDevice = {
      id: Date.now(),
      name: formData.get('deviceName'),
      type: selectedDeviceType.type,
      isOn: false,
      consumption: Number(formData.get('consumption'))
    };

    setZones(prevZones =>
      prevZones.map(zone =>
        zone.id === selectedZone.id
          ? { ...zone, devices: [...zone.devices, newDevice] }
          : zone
      )
    );

    setShowDeviceFormModal(false);
    setSelectedDeviceType(null);
    setSelectedZone(null);
  };

  // Toggle device on/off
  const toggleDevice = (zoneId, deviceId) => {
    setZones(prevZones =>
      prevZones.map(zone =>
        zone.id === zoneId
          ? {
              ...zone,
              devices: zone.devices.map(device =>
                device.id === deviceId ? { ...device, isOn: !device.isOn } : device
              )
            }
          : zone
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Energy Deficit Modal */}
      {showEnergyDeficitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Déficit d'Énergie</h2>
            <p className="mb-4 text-gray-700">
              L'énergie est insuffisante. Veuillez choisir un appareil à éteindre :
            </p>
            <div className="space-y-2 mb-4">
              {getActiveDevices().map(device => (
                <button
                  key={`${device.zoneId}-${device.id}`}
                  onClick={() => turnOffDevice(device.zoneId, device.id)}
                  className="w-full p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-left transition-colors"
                >
                  <div className="font-semibold">{device.name}</div>
                  <div className="text-sm text-gray-600">
                    {device.zoneName} • {device.consumption}W
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={cancelEnergyDeficit}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Add Device Modal - Select Type */}
      {showAddDeviceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Choisir un type d'appareil pour {selectedZone?.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {availableDeviceTypes.map(deviceType => (
                <button
                  key={deviceType.type}
                  onClick={() => selectDeviceType(deviceType)}
                  className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-center"
                >
                  <div className="text-3xl mb-2">{deviceType.icon}</div>
                  <div className="font-semibold text-sm">{deviceType.type}</div>
                  <div className="text-xs text-gray-600">{deviceType.avgConsumption}W</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowAddDeviceModal(false);
                setSelectedZone(null);
              }}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Add Device Form Modal */}
      {showDeviceFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              Ajouter {selectedDeviceType?.icon} {selectedDeviceType?.type}
            </h2>
            <form onSubmit={addDevice} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nom de l'appareil</label>
                <input
                  type="text"
                  name="deviceName"
                  required
                  placeholder={`Ex: ${selectedDeviceType?.type} LG`}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Consommation (Watts)</label>
                <input
                  type="number"
                  name="consumption"
                  required
                  defaultValue={selectedDeviceType?.avgConsumption}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeviceFormModal(false);
                    setSelectedDeviceType(null);
                    setSelectedZone(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={handleBatteryDecrease}>
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
            key={zone.id}
            className={`p-4 rounded-xl shadow bg-white flex flex-col items-center
              ${index < allowed ? "opacity-100" : "opacity-40 pointer-events-none"}
            `}
          >
            <div className="text-4xl">{zone.icon}</div>
            <h2 className="mt-2 text-lg font-bold">{zone.name}</h2>
            <p className="text-sm text-gray-600">Courant max : {zone.currentMax}</p>
            <p className="text-sm text-gray-600">Tension max : {zone.voltageMax}</p>
            
            {/* Device count */}
            <p className="text-xs text-gray-500 mt-1">
              {zone.devices.length} appareil(s)
            </p>

            {/* Device list */}
            {zone.devices.length > 0 && (
              <div className="w-full mt-3 space-y-1">
                {zone.devices.map(device => (
                  <div 
                    key={device.id}
                    className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded"
                  >
                    <span className={device.isOn ? "text-green-600 font-semibold" : "text-gray-400"}>
                      {device.name}
                    </span>
                    <button
                      onClick={() => toggleDevice(zone.id, device.id)}
                      className={`px-2 py-1 rounded text-xs ${
                        device.isOn 
                          ? "bg-green-500 text-white" 
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {device.isOn ? "ON" : "OFF"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              className="mt-3 bg-indigo-600 text-white px-4 py-1 rounded shadow hover:bg-indigo-700 transition-colors"
              onClick={() => openAddDeviceModal(zone)}
            >
              Ajouter appareil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
