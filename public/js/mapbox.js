/* eslint-disable */

export const displayMap = (locations) => {
  const map = L.map('my-map').setView([-29.3150767, 27.4869229], 3);
  L.tileLayer(
    'https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?apiKey=d8a3c17a40f84bf1acc29da6925bbe93',
    {
      attribution:
        'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> contributors',
      maxZoom: 20,
      id: 'osm-bright',
    },
  ).addTo(map);
  map.scrollWheelZoom.disable();
  const markerIcon = L.icon({
    iconUrl: `/img/pin.png`,
    iconSize: [31, 46], // size of the icon
    iconAnchor: [15.5, 42], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -45], // point from which the popup should open relative to the iconAnchor
  });
  locations.forEach((loc) => {
    L.marker([loc.coordinates[1], loc.coordinates[0]], {
      icon: markerIcon,
    })
      .addTo(map)
      .bindPopup(`<p><strong>Day ${loc.day}:</strong> ${loc.description}</p>`);
  });

  const bound = L.latLngBounds(
    locations.map((loc) => [loc.coordinates[1], loc.coordinates[0]]),
  );
  map.fitBounds(bound, { padding: [100, 100] });
};
