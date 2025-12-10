/**/
  function route(originPlaceId, destinationPlaceId, mode) {
    if (!originPlaceId || !destinationPlaceId) {
      return;
    }
    clearRoutes();
    renderers[0].setMap(map);

    directionsService.route(
      {
        origin: { placeId: originPlaceId },
        destination: { placeId: destinationPlaceId },
//        travelMode: google.maps.TravelMode.WALKING,
        travelMode: mode,
      },
      (response, status) => {
        if (status === "OK") {
          renderers[0].setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }

function setupAutocompleteDirectionsHandler(map) {
  var originPlaceId = "";
  var destinationPlaceId = "";
  var travelMode = google.maps.TravelMode.WALKING;
//  var directionsService = new google.maps.DirectionsService();
  var directionsRenderer = new google.maps.DirectionsRenderer({});
  directionsRenderer.setMap(map);
  renderers.push(directionsRenderer);

  const originInput = document.getElementById("journeyfrom");
  const destinationInput = document.getElementById("journeyto");

  const modeSelector = document.getElementById("mode-selector");

  const originAutocomplete = new google.maps.places.Autocomplete(
    originInput,
    { fields: ["place_id", "geometry"] }
  );

  const destinationAutocomplete = new google.maps.places.Autocomplete(
    destinationInput,
    { fields: ["place_id", "geometry"] }
  );

  setupClickListener(
    "changemode-walking",
    google.maps.TravelMode.WALKING,
    route
  );
  setupClickListener(
    "changemode-transit",
    google.maps.TravelMode.TRANSIT,
    route
  );
  setupClickListener(
    "changemode-driving",
    google.maps.TravelMode.DRIVING,
    route
  );

  setupPlaceChangedListener(originAutocomplete, "ORIG", route);
  setupPlaceChangedListener(destinationAutocomplete, "DEST", route);

  function setupClickListener(id, mode, callback) {
    const radioButton = document.getElementById(id);

    radioButton.addEventListener("click", () => {
      travelMode = mode;
      callback(originPlaceId, destinationPlaceId, travelMode);
    });
  }

  function setupPlaceChangedListener(autocomplete, mode, callback) {
    autocomplete.bindTo("bounds", map);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.place_id) {
        window.alert("Please select an option from the dropdown list.");
        return;
      }

      const latLng = `${place.geometry.location.lat()},${place.geometry.location.lng()}`;

      if (mode === "ORIG") {
        originPlaceId = place.place_id;
        document.getElementById("origin-lat-lng").value = latLng;
      } else {
        destinationPlaceId = place.place_id;
        document.getElementById("destination-lat-lng").value = latLng;
      }

      callback(originPlaceId, destinationPlaceId, travelMode);
    });
  }
  route(originPlaceId, destinationPlaceId, travelMode);

}

/**/


//recommend routes
function recommendRoute(location1, location2, location3, location4, map) {

//    // Create a DirectionsService object
//    var directionsService = new google.maps.DirectionsService();

    clearRoutes();

    var renderer1 = renderers[1];
    var renderer2 = renderers[2];
    var renderer3 = renderers[3];
    renderer1.setMap(map);
    renderer2.setMap(map);
    renderer3.setMap(map);


    if (location1 && location2) {
        var request1 = {
          origin: location1,
          destination: location2,
          travelMode: google.maps.TravelMode.WALKING
        };

        directionsService.route(request1, function(result, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            // Customize the start marker
            var startMarker = new google.maps.Marker({
              position: result.routes[0].legs[0].start_location,
              map: map,
              label: "S"
            });

            rendererMarkers.push(startMarker);
            renderer1.setDirections(result);
          }
        });
    }

    if (location2 && location3) {
        var request2 = {
          origin: location2,
          destination: location3,
          travelMode: google.maps.TravelMode.BICYCLING
        };

        directionsService.route(request2, function(result, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            renderer2.setDirections(result);
          }
        });
    }

    if (location3 && location4) {
        var request3 = {
          origin: location3,
          destination: location4,
          travelMode: google.maps.TravelMode.WALKING
        };

        directionsService.route(request3, function(result, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            var endMarker = new google.maps.Marker({
              position: result.routes[0].legs[0].end_location,
              map: map,
              label: "D"
            });

            rendererMarkers.push(endMarker);
            renderer3.setDirections(result);
          }
        });
    }

}
function initRenderers(map) {
    window.renderers = [];
    window.rendererMarkers = [];
    window.directionsService = new google.maps.DirectionsService();

//    let directionsHandler = new AutocompleteDirectionsHandler(map);
    setupAutocompleteDirectionsHandler(map);
//    renderers.push(directionsHandler.directionsRenderer);

    let polylineOptions = {
    strokeOpacity: 0,
    strokeWeight: 0,
    icons: [{
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillOpacity: 1,
        fillColor: '#0f0',
        strokeOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#0f0',
        scale: 3
      },
      offset: '0',
      repeat: '10px'
    }]
  }


    // Create three DirectionsRenderer objects and set their map properties to the map object
//    var renderer1 = new google.maps.DirectionsRenderer({map: map});
    var renderer1 = new google.maps.DirectionsRenderer({map: map, polylineOptions: polylineOptions, suppressMarkers: true, preserveViewport: true});
    var renderer2 = new google.maps.DirectionsRenderer({map: map, suppressMarkers: true, preserveViewport: true});
    var renderer3 = new google.maps.DirectionsRenderer({map: map, polylineOptions: polylineOptions, suppressMarkers: true, preserveViewport: true});
    renderers.push(renderer1);
    renderers.push(renderer2);
    renderers.push(renderer3);

}
function clearRoutes() {
    for (let i = 0; i < renderers.length; i++) {
        renderers[i].setMap(null);
        renderers[i].setDirections({
            routes: [] // Set the routes property to an empty array
          });
    }
    for (let i = 0; i < rendererMarkers.length; i++) {
        rendererMarkers[i].setMap(null);
    }
    rendererMarkers = [];

}