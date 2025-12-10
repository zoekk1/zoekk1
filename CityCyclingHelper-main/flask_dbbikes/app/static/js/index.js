// define the global variables
let map = null;
let infowindow;
let sideBarOpened = false;
//let renderers = [];
// Load the Google Charts library
google.charts.load('current', {'packages':['corechart']});
function initMap() {
    const dublin = {lat: 53.350140, lng: -6.266155};
    const mapProp= {center: dublin, zoom:15};
    const styles = {
        hide: [
            {
                featureType: "poi.business",
                stylers: [{ visibility: "off" }],},
            {
                featureType: "transit",
                elementType: "labels.icon",
                stylers: [{ visibility: "off" }],
            },
            ]
    };
    map = new google.maps.Map(document.getElementById("map"),mapProp);
    map.setOptions({styles: styles['hide']});
    const button = document.createElement("button");
    button.textContent = "Plan Journey";
    button.classList.add("MapButton");
    button.addEventListener("click", function () {
        if (!sideBarOpened) {changeSideBar();}
    });
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(button);
    getStations();
    getWeather();
    initRenderers(map);


}
function getStations() {
    fetch("/stations")
        .then((response) => response.json())
        .then((data) => {
            addMarkers(data);})
}

function addMarkers(stations) {
    // flag for color change
    let selectedButton = null;
    const button_availablebike = document.createElement("button");
    const button_availablebikestands = document.createElement("button")
    button_availablebike.textContent = "Available Bike ";
    // Create an icon element
    const iconElement = document.createElement("i");
    iconElement.className = "fa-solid fa-square-parking";
    iconElement.style.color = "#ffffff";
     // Create an icon element
     const iconElement2 = document.createElement("i");
     iconElement2.className = "fa-solid fa-person-biking";
     iconElement2.style.color = "#ffffff";

    button_availablebikestands.textContent = "Available Bikestands ";
    button_availablebike.classList.add("btn-design");
    button_availablebikestands.classList.add("btn-design")
    button_availablebikestands.appendChild(iconElement);
    button_availablebike.appendChild(iconElement2)

    //set prompt for buttons
    // button_availablebike.title = "Green: availability >= 25\nBlue: 5 < availability < 25\nRed: availability <= 5";
    // button_availablebikestands.title = "Green: availability >= 25\nBlue: 5 < availability < 25\nRed: availability <= 5";
    button_availablebike.appendChild(createDropdown());
    button_availablebikestands.appendChild(createDropdown());


    map.controls[google.maps.ControlPosition.TOP_LEFT].push(button_availablebike);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(button_availablebikestands);

    // console.log("Before loop: stations=", stations);
    stations.forEach(station => {
        // console.log("Inside loop: station=", station);
        var marker = new google.maps.Marker({
        position: {lat: station.position_lat, lng: station.position_lng},
        map: map,
        // icon: markerIcon,
        title: station.name,
        address: station.address,
        station_number: station.number,
         animation: google.maps.Animation.DROP // Add animation property

        });

        // let markerIcon;
       button_availablebike.addEventListener('click', function(){
        if (selectedButton !== null) {
            selectedButton.style.backgroundColor = '';
            selectedButton.style.color = '';
          }
          this.style.backgroundColor = 'rgb(175, 88, 88)';
          this.style.color = 'white';
          selectedButton = this;
        if (station.available_bikes >= 25) {
            // console.log("marker here 992", marker);
          marker.setIcon({
            url: document.getElementById('my-element-1').dataset.imageUrl,
          })
        } else if (station.available_bikes >= 6 && station.available_bikes <=24) {
          marker.setIcon({
            url: document.getElementById('my-element-2').dataset.imageUrl,
          })
        } else if (station.available_bikes <= 5) {
          marker.setIcon({
            url: document.getElementById('my-element-3').dataset.imageUrl,
          })
        } 
      })
    
     button_availablebikestands.addEventListener('click', function(){
       // Update color of selected button
          if (selectedButton !== null) {
            selectedButton.style.backgroundColor = '';
            selectedButton.style.color = '';
          }
          this.style.backgroundColor = 'rgb(175, 88, 88)';
          this.style.color = 'white';
          selectedButton = this;
          if (station.available_bike_stands >= 25) {
            marker.setIcon({
              url: document.getElementById('my-element-1').dataset.imageUrl,
            })
          } else if (station.available_bike_stands >= 6 && station.available_bikes <=24) {
            marker.setIcon({
              url: document.getElementById('my-element-2').dataset.imageUrl,
            })
          } else if (station.available_bike_stands <= 5) {
            marker.setIcon({
              url: document.getElementById('my-element-3').dataset.imageUrl,
            })
          }
     });

            //Winnie's codes
        google.maps.event.addListener(map, 'zoom_changed', function() {
            var pixelSizeAtZoom0 = 50; //the size of the icon at zoom level 0
            var maxPixelSize = 50; //restricts the maximum size of the icon, otherwise the browser will choke at higher zoom levels trying to scale an image to millions of pixels

            var zoom = map.getZoom();
            var relativePixelSize = Math.round(pixelSizeAtZoom0*Math.pow(2,zoom)); // use 2 to the power of current zoom to calculate relative pixel size.  Base of exponent is 2 because relative size should double every time you zoom in

            if(relativePixelSize > maxPixelSize) //restrict the maximum size of the icon
                relativePixelSize = maxPixelSize;

              if (marker.getIcon()) {
                marker.setIcon(
                  new google.maps.MarkerImage(
                    marker.getIcon().url, //marker's same icon graphic
                    null, //size
                    null, //origin
                    null, //anchor
                    new google.maps.Size(relativePixelSize, relativePixelSize) //changes the scale
                  )
                );
              }


        });
        marker.addListener("mouseover", () => {
            marker.setAnimation(google.maps.Animation.BOUNCE);

            const content = `<h1 style="text-align: center; font-size:25px; "> ${station.name} <h1>
            <p style="font-size:20px"> 
            <i class="fa-sharp fa-solid fa-square-parking"></i>
            Available Bikes Stand: ${station.available_bike_stands} 
            </p>
            <p style="font-size:20px">
            <i class="fa-solid fa-person-biking"></i>
            Available Bikes: ${station.available_bikes} 
            </p>
            <p style="font-size:20px">
            <i class="fas fa-check-circle"></i>
            Status: ${station.status}
            </p>`

            infowindow = new google.maps.InfoWindow({content: content});
            infowindow.open({anchor: marker, map: map});
            // console.log("open window here", station.number);
        });
        marker.addListener("mouseout", () => {
            marker.setAnimation(null);
            infowindow.close();
        });

        marker.addListener("click", () => {
            openStationCard(station.number);
        });
    });
}
function openStationCard(number) {
    if (!sideBarOpened) {changeSideBar();}
    let info = document.getElementById("info");
    if (info.innerHTML.trim() !== '') {
        info.innerHTML = '';
    }

    createStationCard(number, "realtime").then(card => {
        info.appendChild(card);

    });
}
async function createStationCard(number, type, data) {
    // console.log("station in createCard", data);

    let card = document.createElement("div");
    card.classList.add("stationCard");
    card.dataset.number = number;
    let station;


    let textDetail = document.createElement("div");
    textDetail.classList.add("textDetail");


    if (type === "predict_orig") {
        station = data;
        textDetail.innerHTML =
            `<h2 >From: ${station.name}</h2>
            <p style="font-size: 25px"> <i class="fa-solid fa-person-biking"></i>  Bikes(Predict): ${station.bikes}/${station.bike_stands}</p>
            <p style="font-size: 25px"> <i class="fa-solid fa-walking"></i>  Distance: ${station.distance_text} (${station.duration_text})</p>
            <p style="font-size: 25px">Address: ${station.address}</p>`;
        card.appendChild(textDetail);
        return card;
    }
    if (type === "predict_des") {
        station = data;
        textDetail.innerHTML =
            `<h2 >To: ${station.name}</h2>
            <p style="font-size: 25px"> <i class="fa-sharp fa-solid fa-square-parking"></i>  Stands(Predict): ${station.stands}/${station.bike_stands}</p>
            <p style="font-size: 25px"> <i class="fa-solid fa-walking"></i>  Distance: ${station.distance_text} (${station.duration_text})</p>
            <p style="font-size: 25px"> Address: ${station.address}</p>`;
        card.appendChild(textDetail);
        return card;
    }

    try {
        let response = await fetch("/station/" + number);
        station = await response.json();
    } catch (error) {
        console.error('Error fetching station card data:', error);
    }

    textDetail.innerHTML =
        `<h2 >${station.name}</h2>
        <p style="font-size: 25px">Stands: ${station.available_bike_stands}/${station.bike_stands}</p>
        <p style="font-size: 25px">Bikes: ${station.available_bikes}/${station.bike_stands}</p>
        <p style="font-size: 25px">Status: ${station.status}</p>
        <p style="font-size: 25px">Address: ${station.address}</p>`;
    card.appendChild(textDetail);
    let trendButton = document.createElement("button");
    trendButton.classList.add("trendButton");
    // trendButton.setAttribute("id", "trendButton");
    trendButton.textContent = "Show/Hide Trends";
    trendButton.addEventListener("click", function () {trends_switch(trendButton)});
    card.appendChild(trendButton);

    buttonGroup = createButtonGroup();
    let bike_chart = document.createElement("div");
    bike_chart.classList.add("bike_chart");
    let stand_chart = document.createElement("div");
    stand_chart.classList.add("stand_chart");
    card.appendChild(buttonGroup);
    card.appendChild(bike_chart);
    card.appendChild(stand_chart);
    return card;
}
function trends_switch(btn) {
    const card = btn.parentElement;
    const number = card.dataset.number;
    const bike_chart = card.querySelector(".bike_chart");
    const stand_chart = card.querySelector(".stand_chart");
    const buttonGroup = card.querySelector(".button-group");
    if (window.getComputedStyle(bike_chart).getPropertyValue('display') === 'none') {
        bike_chart.style.display = "block";
        stand_chart.style.display = "block"
        buttonGroup.style.display = "flex";
        drawChart(number, "history");
    } else {
        bike_chart.style.display = "none";
        stand_chart.style.display = "none";
        buttonGroup.style.display = "none";
    }
}
function changeSideBar() {
    const leftSection = document.getElementById("leftSection");
    const mapSection = document.getElementById("map");
    // if (leftSection.style.width === "0px" || leftSection.style.width === "") {
    if (!sideBarOpened) {
        leftSection.style.width = "600px";
        mapSection.style.marginLeft = "600px";
        sideBarOpened = true;
    } else {
        leftSection.style.width = "0px";
        mapSection.style.marginLeft = "0px";
        const info = document.getElementById("info");
        info.innerHTML = '';
        sideBarOpened = false;
    }
}


async function drawChart(number, type) {
    let url;
    if (type === "history") {
        url = "/occupancy/" + number;
    } else if (type === "predict_24h") {
        url = "/predict_24h/" + number;
    } else {
        url = "/predict_5d/" + number;
    }
    let response_data;
    try {
        const response = await fetch(url);
        response_data = await response.json();
    } catch (error) {
        console.error('Error fetching occupancy data:', error);
    }
    if (response_data && response_data.length > 0) {
        const bikesData = response_data.map(item => [item.time, item.bikes]);
        const standsData = response_data.map(item => [item.time, item.stands]);
        const bikes_stands_sum = response_data[0].bikes + response_data[0].stands;
        const card = document.querySelector('.stationCard[data-number="' + parseInt(number) + '"]');
        const bike_chart = card.querySelector(".bike_chart");
        const stand_chart = card.querySelector(".stand_chart");
        basicDraw(bikesData, bikes_stands_sum, bike_chart);
        basicDraw(standsData, bikes_stands_sum, stand_chart);
    } else {
        console.error("Invalid station number!");
    }
}



function basicDraw(bikeData, range, div) {
    let y;
    if (div.className === "bike_chart") {
        y = "Bikes";
    } else {
        y = "Stands";
    }
    // Create the data table
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Time');
    data.addColumn('number', y);
    data.addRows(bikeData);

var options = {
    title: 'Trends for ' + y,
    titleTextStyle: {color: '#f7f5f5'}, // Change the chart title text color
    hAxis: {
        title: 'Time',
        titleTextStyle: {color: '#f7f5f5'},
        textPosition: 'none',
        textStyle: {color: '#f7f5f5'}, // Change the hAxis label text color
    },
    vAxis: {
        minValue: 0,
        maxValue: range,
        textStyle: {color: '#f7f5f5'}, // Change the vAxis label text color
        format: '0', // Display y-axis numbers as integers
    },
    legend: {
        position: 'top',
        textStyle: {color: '#f7f5f5'}, // Change the legend text color
    },
    height: 300,
    width: 550,
    fontSize: 12.5,
    colors: ['#782a04'], // Change this to the desired gradient color
    interpolateNulls: true,
    animation: {
        duration: 1000,
        easing: 'out',
        startup: true,
    },
    isStacked: true,
    areaOpacity: 0.5,
    backgroundColor: '#030000', // Change to your desired chart background color
    chartArea: {
        backgroundColor: '#030000', // Change to your desired chartArea background color
    },
};

    // Create and draw the chart
    var chart = new google.visualization.AreaChart(div);
    chart.draw(data, options);
}
//functions to switch the charts
function selectStatus(clickedButton, status) {
  // Get the parent button group for the clicked button
  const buttonGroup = clickedButton.parentNode;

  // Remove the "selected" class from all buttons in the button group
  const buttons = buttonGroup.getElementsByClassName("chart-button");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("selected");
  }

  // Add the "selected" class to the clicked button
  clickedButton.classList.add("selected");
  // change charts
    const card = buttonGroup.parentElement;
    const number = card.dataset.number;
    drawChart(number, status);
}
function createButtonGroup() {
    const buttonGroup = document.createElement("div");
    buttonGroup.className = "button-group";

    const buttonNames = ["history", "predict_24h", "predict_5d"];
    const buttonTexts = ["History", "24h Prediction", "5d Prediction"];

    for (let i = 0; i < buttonNames.length; i++) {
        const button = document.createElement("button");
        button.className = `chart-button ${buttonNames[i]}`;
        // button.textContent = buttonNames[i];
        button.textContent = buttonTexts[i];
        button.onclick = function () {
            selectStatus(button, buttonNames[i]);
        };
        // if (button.textContent === "history") {
        if (button.textContent === "History") {
            button.classList.add("selected");
        }
        buttonGroup.appendChild(button);
    }

    return buttonGroup;
}

// functions to do recommendation
async function submitForm() {
    event.preventDefault();
  // Collect form data
  const journeyDate = document.getElementById("journeydate").value;
  const journeyTime = document.getElementById("journeytime").value;
  const journeyFrom = document.getElementById("journeyfrom").value;
  const journeyTo = document.getElementById("journeyto").value;
  const journeyMode = document.querySelector('input[name="type"]:checked').value;
  const originLatLng = document.getElementById("origin-lat-lng").value;
  const destinationLatLng = document.getElementById("destination-lat-lng").value;

  // Create FormData object to send data to the backend
  const formData = new FormData();
  formData.append("journeydate", journeyDate);
  formData.append("journeytime", journeyTime);
  formData.append("journeyfrom", journeyFrom);
  formData.append("journeyto", journeyTo);
  formData.append("type", journeyMode);
  formData.append("origin_lat_lng", originLatLng);
  formData.append("destination_lat_lng", destinationLatLng);

  // Send the data to the backend using fetch and handle the response
  try {
    const response = await fetch("/plan", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
        // handle the situation that the form is not submitted via button
        if (data["error"]) {
            return;
        }
        let info = document.getElementById("info");
        if (info.innerHTML.trim() !== '') {
         info.innerHTML = '';
        }
        console.log(journeyFrom);
        //draw routes
//        clearRoutes();
        const l1 = journeyFrom;
        const l2 = Object.keys(data["orig"]).length > 0 ? {lat: data["orig"]["position_lat"], lng: data["orig"]["position_lng"]} : null;
        const l3 = Object.keys(data["des"]).length > 0 ? {lat: data["des"]["position_lat"], lng: data["des"]["position_lng"]} : null;
        const l4 = journeyTo;
        recommendRoute(l1, l2, l3, l4, map);

        // Create the warn icon
        const warnIcon = document.createElement('i');
        warnIcon.classList.add('fas', 'fa-exclamation-triangle', 'warn-icon');
        // Create the warn text
        const warnText = document.createElement('span');
        warnText.classList.add('warn-text');
        warnText.textContent = 'The prediction is based on 5-day weather forecast and history trends. Please note that there may be deviations.';
        //Create no recommend icon and text
        const noRecIcon = document.createElement('i');
        // noRecIcon.classList.add('fas', 'fa-exclamation-triangle', 'warn-icon');
        noRecIcon.classList.add('fas', 'fa-sad-cry', 'warn-icon');
        const noRecText = document.createElement('span');
        noRecText.classList.add('warn-text');


        //1. only has station nearby the start point
        if (Object.keys(data["orig"]).length !== 0 && Object.keys(data["des"]).length === 0) {
            let card_orig = await createStationCard(data["orig"]["number"], "predict_orig", data["orig"]);
            info.appendChild(card_orig);
            noRecText.textContent = 'OOPS! No available parking stations for your destination in 3KM!';
            info.appendChild(noRecIcon);
            info.appendChild(noRecText);
            info.appendChild(warnIcon);
            info.appendChild(warnText);
            return;
        }
        //2. only has station nearby the end point
        if (Object.keys(data["des"]).length !== 0 && Object.keys(data["orig"]).length === 0) {
            let card_des = await createStationCard(data["des"]["number"], "predict_des", data["des"]);
            info.appendChild(card_des);
            noRecText.textContent = 'OOPS! No available bike stations for your origin in 3KM!';
            info.appendChild(noRecIcon);
            info.appendChild(noRecText);
            info.appendChild(warnIcon);
            info.appendChild(warnText);
            return;
        }
        //3. no available stations nearby the start point and end point
      if (Object.keys(data["orig"]).length === 0 && Object.keys(data["des"]).length === 0) {
          noRecText.textContent = 'OOPS! No available bike stations and parking stations for your origin and destination in 3KM!';
            info.appendChild(noRecIcon);
            info.appendChild(noRecText);
            return;
      }

        //4. available stations nearby the start point and end point
        let card_orig = await createStationCard(data["orig"]["number"], "predict_orig", data["orig"]);
        info.appendChild(card_orig);
        let card_des = await createStationCard(data["des"]["number"], "predict_des", data["des"]);
        info.appendChild(card_des);
        info.appendChild(warnIcon);
        info.appendChild(warnText);
    } else {
      console.error("Error in submitting the form");
    }
  } catch (error) {
    console.error("Error in submitting the form", error);
  }

  // Prevent the form from submitting and reloading the page
  return false;
}


//prompt for color
function createDropdown() {
  const dropdown = document.createElement('div');
  dropdown.classList.add('prompt_dropdown');

  const colors = ['green', 'blue', 'red'];
  const texts = [
    'More than 25',
    'Between 5 to 25',
    'Less than 5',
  ];

  for (let i = 0; i < colors.length; i++) {
    const line = document.createElement('div');
    line.classList.add('prompt_line');

    const square = document.createElement('span');
    square.classList.add('prompt_square');
    square.style.backgroundColor = colors[i];

    const text = document.createElement('span');
    text.classList.add('prompt_text');
    text.textContent = texts[i];

    line.appendChild(square);
    line.appendChild(text);
    dropdown.appendChild(line);
  }

  return dropdown;
}
