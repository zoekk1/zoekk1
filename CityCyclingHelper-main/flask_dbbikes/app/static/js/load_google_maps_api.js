async function loadGoogleMapsAPI() {
  const response = await fetch('/google_maps_key');
  const data = await response.json();
  const google_maps_key = data.google_maps_key;

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${google_maps_key}&libraries=places&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
}

// Call the loadGoogleMapsAPI function to load the Google Maps API
loadGoogleMapsAPI();
