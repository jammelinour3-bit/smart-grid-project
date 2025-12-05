import { useState, useEffect } from "react";

export default function App() {
  const [battery, setBattery] = useState(85);
  const [showEnergyDeficitModal, setShowEnergyDeficitModal] = useState(false);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showDeviceFormModal, setShowDeviceFormModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
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

  // Calculate consumption per zone
  const getZoneConsumption = () => {
    return zones.map(zone => {
      const totalConsumption = zone.devices
        .filter(d => d.isOn)
        .reduce((sum, d) => sum + d.consumption, 0);
      return { name: zone.name, consumption: totalConsumption, icon: zone.icon };
    }).filter(z => z.consumption > 0);
  };

  // Calculate total consumption
  const getTotalConsumption = () => {
    return zones.reduce((total, zone) => {
      return total + zone.devices.filter(d => d.isOn).reduce((sum, d) => sum + d.consumption, 0);
    }, 0);
  };

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

  // Circular chart component
  const CircularConsumptionChart = () => {
    const zoneConsumptions = getZoneConsumption();
    const totalConsumption = getTotalConsumption();
    
    if (totalConsumption === 0) {
      return (
        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-sm">Aucune</div>
            <div className="text-xs">consommation</div>
          </div>
        </div>
      );
    }
    
    const colors = ['#60a5fa', '#f59e0b', '#10b981', '#ec4899'];
    
    let cumulativePercentage = 0;
    
    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {zoneConsumptions.map((zone, index) => {
            const percentage = (zone.consumption / totalConsumption) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = -cumulativePercentage;
            cumulativePercentage += percentage;
            
            return (
              <circle
                key={zone.name}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalConsumption}W</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0f16] text-gray-200 p-6 font-sans">
      {/* Energy Deficit Modal */}
      {showEnergyDeficitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#0f1724] border border-[#2a3442] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-red-400 mb-3">⚠️ Déficit d'Énergie</h2>
            <p className="mb-4 text-gray-300">
              L'énergie est insuffisante. Choisissez un appareil à éteindre :
            </p>
            <div className="space-y-3 mb-4">
              {getActiveDevices().map(device => (
                <button
                  key={`${device.zoneId}-${device.id}`}
                  onClick={() => turnOffDevice(device.zoneId, device.id)}
                  className="w-full p-3 bg-[#08101a] hover:bg-[#0b1620] border border-[#26313b] rounded-lg text-left transition-colors"
                >
                  <div className="font-semibold text-gray-100">{device.name}</div>
                  <div className="text-sm text-gray-400">
                    {device.zoneName} • {device.consumption}W
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={cancelEnergyDeficit}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 rounded transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Add Device Modal - Select Type */}
      {showAddDeviceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#0f1724] border border-[#2a3442] rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Choisir un type d'appareil pour {selectedZone?.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {availableDeviceTypes.map(deviceType => (
                <button
                  key={deviceType.type}
                  onClick={() => selectDeviceType(deviceType)}
                  className="p-4 bg-[#071023] hover:bg-[#08142b] border border-[#274056] rounded-lg transition-colors text-center"
                >
                  <div className="text-3xl mb-2">{deviceType.icon}</div>
                  <div className="font-semibold text-sm">{deviceType.type}</div>
                  <div className="text-xs text-gray-400">{deviceType.avgConsumption}W</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowAddDeviceModal(false);
                setSelectedZone(null);
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 rounded transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Add Device Form Modal */}
      {showDeviceFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#0f1724] border border-[#2a3442] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
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
                  className="w-full p-2 bg-[#071022] border border-[#26313b] rounded focus:outline-none focus:border-[#3b82f6] text-gray-100"
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
                  className="w-full p-2 bg-[#071022] border border-[#26313b] rounded focus:outline-none focus:border-[#3b82f6] text-gray-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded transition-colors"
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
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 rounded transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Layout */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-2 bg-[#0b1218] rounded-2xl p-4 shadow-inner border border-[#1f2933]">
          <div className="mb-6">
            <div className="text-2xl font-bold text-white mb-2">SmartHome</div>
            <div className="text-xs text-gray-400">Panneau de contrôle</div>
          </div>
          <nav className="space-y-3 mt-6">
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full text-left px-3 py-2 rounded-lg ${currentPage === 'dashboard' ? 'bg-gradient-to-r from-[#2b1a4b] to-[#3b2a6b] text-pink-300 font-semibold' : 'hover:bg-[#071223]'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setCurrentPage('consommation')}
              className={`w-full text-left px-3 py-2 rounded-lg ${currentPage === 'consommation' ? 'bg-gradient-to-r from-[#2b1a4b] to-[#3b2a6b] text-pink-300 font-semibold' : 'hover:bg-[#071223]'}`}
            >
              Calcul Consommation
            </button>
            <button 
              onClick={() => setCurrentPage('vente')}
              className={`w-full text-left px-3 py-2 rounded-lg ${currentPage === 'vente' ? 'bg-gradient-to-r from-[#2b1a4b] to-[#3b2a6b] text-pink-300 font-semibold' : 'hover:bg-[#071223]'}`}
            >
              Vente
            </button>
            <button 
              onClick={() => setCurrentPage('photovoltaique')}
              className={`w-full text-left px-3 py-2 rounded-lg ${currentPage === 'photovoltaique' ? 'bg-gradient-to-r from-[#2b1a4b] to-[#3b2a6b] text-pink-300 font-semibold' : 'hover:bg-[#071223]'}`}
            >
              Photovoltaïque
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="col-span-10">
          {currentPage === 'dashboard' && (
            <>
          {/* Top cards */}
          <div className="grid grid-cols-12 gap-4 mb-6">
            <div className="col-span-8 bg-gradient-to-r from-[#5eead4] via-[#60a5fa] to-[#7c3aed] rounded-2xl p-6 shadow-lg text-[#021023]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">BATTERY PRODUCTION</div>
                  <div className="text-5xl font-extrabold mt-2">{battery}%</div>
                </div>
                <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center border border-white/20">
                  <div className="text-2xl font-bold">🔋</div>
                </div>
              </div>
            </div>
            <div className="col-span-4 bg-[#071226] rounded-2xl p-4 shadow-inner border border-[#22303b]">
              <div className="text-xs text-gray-400 mb-3">Consommation par zone</div>
              <CircularConsumptionChart />
              <div className="mt-3 space-y-1">
                {getZoneConsumption().map((zone, index) => (
                  <div key={zone.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#60a5fa', '#f59e0b', '#10b981', '#ec4899'][index % 4] }}></span>
                      {zone.icon} {zone.name}
                    </span>
                    <span className="text-gray-300">{zone.consumption}W</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Zones cards row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {zones.map((zone, index) => (
              <div key={zone.id} className={`rounded-2xl p-5 border border-[#164055] ${index < allowed ? 'bg-[#081826]' : 'bg-[#061017] opacity-50 pointer-events-none'} shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{zone.icon}</div>
                  <div className="text-xs text-gray-400">{zone.devices.length} appareils</div>
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">{zone.name}</h3>
                <p className="text-sm text-gray-400">CURRENT MAX: <span className="text-white">{zone.currentMax}</span></p>
                <p className="text-sm text-gray-400">VOLTAGE MAX: <span className="text-white">{zone.voltageMax}</span></p>
                {zone.devices.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {zone.devices.map(device => (
                      <div key={device.id} className="flex items-center justify-between bg-[#071424] p-2 rounded">
                        <div className={device.isOn ? 'text-green-300 font-semibold text-xs' : 'text-gray-500 text-xs'}>{device.name}</div>
                        <button onClick={() => toggleDevice(zone.id, device.id)} className={`px-2 py-1 rounded text-xs ${device.isOn ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-200'}`}>
                          {device.isOn ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => openAddDeviceModal(zone)} className="mt-4 w-full bg-gradient-to-r from-[#7c3aed] to-[#60a5fa] text-black font-semibold py-2 rounded-lg">Ajouter appareil</button>
              </div>
            ))}
          </div>

          {/* Global consumption bar */}
          <div className="rounded-2xl p-6 bg-[#071226] border border-[#22303b] shadow-inner mb-6">
            <div className="text-xl font-bold text-orange-400">GLOBAL MAX CONSUMPTION: 57A</div>
          </div>

          {/* Bottom: Controls and battery */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 bg-[#071226] p-5 rounded-2xl border border-[#22303b]">
              <div className="text-sm text-gray-400">État de la Batterie</div>
              <div className="mt-3">
                <div className="h-6 w-full bg-[#021017] rounded-full overflow-hidden border border-[#12313b]">
                  <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500" style={{ width: `${battery}%` }}></div>
                </div>
                <p className="mt-2 text-gray-300 font-semibold">{battery}% restant</p>

                <div className="flex gap-2 mt-3">
                  <button onClick={() => setBattery((b) => Math.min(100, b + 10))} className="flex-1 bg-[#2b6cb0] hover:bg-[#1e4f7a] text-white px-3 py-2 rounded">+10%</button>
                  <button onClick={handleBatteryDecrease} className="flex-1 bg-[#b02a2a] hover:bg-[#8a1e1e] text-white px-3 py-2 rounded">-10%</button>
                </div>

                <p className="mt-3 text-xs text-gray-400">Zones actives autorisées : <b className="text-white">{allowed}</b></p>
              </div>
            </div>

            <div className="col-span-2 bg-[#071226] p-5 rounded-2xl border border-[#22303b]">
              <div className="text-sm text-gray-400 mb-4">Liste des appareils actifs</div>
              <div className="grid grid-cols-2 gap-3">
                {getActiveDevices().map(d => (
                  <div key={d.id + '-' + d.zoneId} className="bg-[#061424] p-3 rounded-lg border border-[#13313b]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{d.name}</div>
                        <div className="text-xs text-gray-400">{d.zoneName} • {d.consumption}W</div>
                      </div>
                      <button onClick={() => turnOffDevice(d.zoneId, d.id)} className="px-2 py-1 bg-red-500 rounded text-white text-xs">Éteindre</button>
                    </div>
                  </div>
                ))}
                {getActiveDevices().length === 0 && <div className="text-gray-400 col-span-2">Aucun appareil actif</div>}
              </div>
            </div>
          </div>
            </>
          )}

          {currentPage === 'consommation' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-6">Calcul de Consommation</h2>
              
              {/* Real-time consumption */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#071226] rounded-2xl p-6 border border-[#22303b]">
                  <div className="text-sm text-gray-400 mb-2">Consommation par Heure</div>
                  <div className="text-4xl font-bold text-blue-400">{getTotalConsumption()}W</div>
                  <div className="text-xs text-gray-400 mt-2">En temps réel</div>
                </div>
                
                <div className="bg-[#071226] rounded-2xl p-6 border border-[#22303b]">
                  <div className="text-sm text-gray-400 mb-2">Consommation par Jour</div>
                  <div className="text-4xl font-bold text-green-400">{(getTotalConsumption() * 24 / 1000).toFixed(2)} kWh</div>
                  <div className="text-xs text-gray-400 mt-2">Estimation 24h</div>
                </div>
                
                <div className="bg-[#071226] rounded-2xl p-6 border border-[#22303b]">
                  <div className="text-sm text-gray-400 mb-2">Consommation par An</div>
                  <div className="text-4xl font-bold text-purple-400">{(getTotalConsumption() * 24 * 365 / 1000).toFixed(2)} kWh</div>
                  <div className="text-xs text-gray-400 mt-2">Estimation annuelle</div>
                </div>
              </div>

              {/* Breakdown by zone */}
              <div className="bg-[#071226] rounded-2xl p-6 border border-[#22303b]">
                <h3 className="text-xl font-bold mb-4">Détails par Zone</h3>
                <div className="space-y-3">
                  {zones.map(zone => {
                    const zoneConsumption = zone.devices.filter(d => d.isOn).reduce((sum, d) => sum + d.consumption, 0);
                    return (
                      <div key={zone.id} className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{zone.icon}</span>
                            <div>
                              <div className="font-bold">{zone.name}</div>
                              <div className="text-xs text-gray-400">{zone.devices.filter(d => d.isOn).length} appareils actifs</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-400">{zoneConsumption}W</div>
                            <div className="text-xs text-gray-400">{(zoneConsumption * 24 / 1000).toFixed(2)} kWh/jour</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentPage === 'vente' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-6">Vente d'Électricité</h2>
              
              {/* Price settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#071226] rounded-2xl p-6 border border-[#22303b]">
                  <div className="text-sm text-gray-400 mb-2">Prix par kWh (STEG)</div>
                  <div className="text-4xl font-bold text-green-400">0.150 TND</div>
                  <div className="text-xs text-gray-400 mt-2">Tarif d'achat</div>
                </div>
                
                <div className="bg-[#071226] rounded-2xl p-6 border border-[#22303b]">
                  <div className="text-sm text-gray-400 mb-2">Production Solaire</div>
                  <div className="text-4xl font-bold text-yellow-400">{(battery * 50)}W</div>
                  <div className="text-xs text-gray-400 mt-2">Capacité actuelle</div>
                </div>
              </div>

              {/* Monthly calculation */}
              <div className="bg-[#071226] rounded-2xl p-6 border border-[#22303b]">
                <h3 className="text-xl font-bold mb-4">Calcul Mensuel</h3>
                <div className="space-y-4">
                  <div className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-400">Production mensuelle</div>
                        <div className="text-2xl font-bold text-green-400">{((battery * 50) * 24 * 30 / 1000).toFixed(2)} kWh</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Valeur</div>
                        <div className="text-2xl font-bold text-green-400">{(((battery * 50) * 24 * 30 / 1000) * 0.150).toFixed(2)} TND</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-400">Consommation mensuelle</div>
                        <div className="text-2xl font-bold text-red-400">{(getTotalConsumption() * 24 * 30 / 1000).toFixed(2)} kWh</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Coût</div>
                        <div className="text-2xl font-bold text-red-400">{((getTotalConsumption() * 24 * 30 / 1000) * 0.150).toFixed(2)} TND</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#5eead4] via-[#60a5fa] to-[#7c3aed] p-6 rounded-lg">
                    <div className="flex justify-between items-center text-[#021023]">
                      <div>
                        <div className="text-sm font-semibold">Économie mensuelle</div>
                        <div className="text-xs opacity-75">Production - Consommation</div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-extrabold">
                          {(((battery * 50) * 24 * 30 / 1000) * 0.150 - ((getTotalConsumption() * 24 * 30 / 1000) * 0.150)).toFixed(2)} TND
                        </div>
                        <div className="text-xs font-semibold">par mois</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                    <div className="text-sm text-gray-400 mb-2">Prix par jour</div>
                    <div className="text-3xl font-bold text-blue-400">
                      {(((battery * 50) * 24 / 1000) * 0.150 - ((getTotalConsumption() * 24 / 1000) * 0.150)).toFixed(3)} TND
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'photovoltaique' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-6">Nombre de Panneaux Photovoltaïques & Autonomie</h2>
              
              {/* Energy consumption */}
              <div className="bg-[#071226] rounded-2xl p-6 border border-[#22303b]">
                <h3 className="text-xl font-bold mb-4">Consommation de la Maison</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                    <div className="text-sm text-gray-400 mb-2">Consommation par Mois</div>
                    <div className="text-4xl font-bold text-orange-400">{(getTotalConsumption() * 24 * 30 / 1000).toFixed(2)} kWh</div>
                  </div>
                  <div className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                    <div className="text-sm text-gray-400 mb-2">Moyenne par Jour</div>
                    <div className="text-4xl font-bold text-blue-400">{(getTotalConsumption() * 24 / 1000).toFixed(2)} kWh</div>
                  </div>
                </div>
              </div>

              {/* Solar panels needed */}
              <div className="bg-[#071226] rounded-2xl p-6 border border-[#22303b]">
                <h3 className="text-xl font-bold mb-4">Panneaux Solaires Nécessaires</h3>
                <div className="space-y-4">
                  <div className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-400">Type de panneau recommandé</div>
                        <div className="text-xl font-bold">Panneau 400W</div>
                        <div className="text-xs text-gray-400 mt-1">Production: ~1.6 kWh/jour (4h soleil)</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Nombre nécessaire</div>
                        <div className="text-5xl font-extrabold text-yellow-400">
                          {Math.ceil((getTotalConsumption() * 24 / 1000) / 1.6)}
                        </div>
                        <div className="text-xs text-gray-400">panneaux</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                    <div className="text-sm text-gray-400 mb-2">Puissance totale installée</div>
                    <div className="text-3xl font-bold text-green-400">
                      {(Math.ceil((getTotalConsumption() * 24 / 1000) / 1.6) * 400 / 1000).toFixed(1)} kW
                    </div>
                  </div>
                </div>
              </div>

              {/* Autonomy */}
              <div className="bg-gradient-to-r from-[#5eead4] via-[#60a5fa] to-[#7c3aed] rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-[#021023]">Autonomie du Système</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur p-4 rounded-lg">
                    <div className="text-sm font-semibold text-[#021023] mb-2">Capacité Batterie Actuelle</div>
                    <div className="text-4xl font-extrabold text-[#021023]">{battery}%</div>
                    <div className="text-xs text-[#021023] mt-1">≈ {(battery * 50 / getTotalConsumption()).toFixed(1)} heures</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur p-4 rounded-lg">
                    <div className="text-sm font-semibold text-[#021023] mb-2">Autonomie Complète</div>
                    <div className="text-4xl font-extrabold text-[#021023]">
                      {(100 * 50 / getTotalConsumption()).toFixed(1)}h
                    </div>
                    <div className="text-xs text-[#021023] mt-1">À 100% de charge</div>
                  </div>
                </div>
                <div className="mt-4 bg-white/20 backdrop-blur p-4 rounded-lg">
                  <div className="text-sm font-semibold text-[#021023] mb-2">Temps de recharge solaire</div>
                  <div className="text-2xl font-bold text-[#021023]">
                    ~{Math.ceil((100 - battery) * 50 / ((Math.ceil((getTotalConsumption() * 24 / 1000) / 1.6) * 400) / 4))} heures
                  </div>
                  <div className="text-xs text-[#021023] mt-1">Avec {Math.ceil((getTotalConsumption() * 24 / 1000) / 1.6)} panneaux de 400W</div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'devices' && (
            <div className="bg-[#071226] rounded-2xl p-6 border border-[#22303b]">
              <h2 className="text-2xl font-bold mb-6">Tous les Appareils</h2>
              <div className="space-y-4">
                {zones.map(zone => (
                  <div key={zone.id} className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                    <h3 className="text-lg font-bold text-white mb-3">{zone.icon} {zone.name}</h3>
                    {zone.devices.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {zone.devices.map(device => (
                          <div key={device.id} className="bg-[#071424] p-3 rounded border border-[#26313b]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold">{device.name}</span>
                              <button onClick={() => toggleDevice(zone.id, device.id)} className={`px-2 py-1 rounded text-xs ${device.isOn ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-200'}`}>
                                {device.isOn ? 'ON' : 'OFF'}
                              </button>
                            </div>
                            <div className="text-xs text-gray-400">Type: {device.type}</div>
                            <div className="text-xs text-gray-400">Consommation: {device.consumption}W</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">Aucun appareil dans cette zone</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage === 'history' && (
            <div className="bg-[#071226] rounded-2xl p-6 border border-[#22303b]">
              <h2 className="text-2xl font-bold mb-6">Historique de Consommation</h2>
              <div className="space-y-4">
                <div className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                  <h3 className="text-lg font-bold mb-3">Consommation Actuelle</h3>
                  <div className="text-4xl font-bold text-green-400">{getTotalConsumption()}W</div>
                  <div className="text-sm text-gray-400 mt-2">Total en temps réel</div>
                </div>
                <div className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                  <h3 className="text-lg font-bold mb-3">Niveau Batterie</h3>
                  <div className="text-4xl font-bold text-blue-400">{battery}%</div>
                  <div className="h-4 w-full bg-[#021017] rounded-full overflow-hidden border border-[#12313b] mt-3">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500" style={{ width: `${battery}%` }}></div>
                  </div>
                </div>
                <div className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                  <h3 className="text-lg font-bold mb-3">Appareils Actifs</h3>
                  <div className="text-4xl font-bold text-orange-400">{getActiveDevices().length}</div>
                  <div className="text-sm text-gray-400 mt-2">Nombre d'appareils en marche</div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'settings' && (
            <div className="bg-[#071226] rounded-2xl p-6 border border-[#22303b]">
              <h2 className="text-2xl font-bold mb-6">Paramètres</h2>
              <div className="space-y-4">
                <div className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                  <h3 className="text-lg font-bold mb-3">Règles de Batterie</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-[#071424] rounded">
                      <span>Batterie ≥ 60%</span>
                      <span className="text-green-400">4 zones actives</span>
                    </div>
                    <div className="flex justify-between p-2 bg-[#071424] rounded">
                      <span>Batterie ≥ 40%</span>
                      <span className="text-blue-400">3 zones actives</span>
                    </div>
                    <div className="flex justify-between p-2 bg-[#071424] rounded">
                      <span>Batterie ≥ 30%</span>
                      <span className="text-orange-400">2 zones actives</span>
                    </div>
                    <div className="flex justify-between p-2 bg-[#071424] rounded">
                      <span>Batterie &lt; 30%</span>
                      <span className="text-red-400">1 zone active</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#081826] p-4 rounded-lg border border-[#164055]">
                  <h3 className="text-lg font-bold mb-3">Informations Système</h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div>Version: 1.0.0</div>
                    <div>Zones configurées: {zones.length}</div>
                    <div>Total appareils: {zones.reduce((sum, zone) => sum + zone.devices.length, 0)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
