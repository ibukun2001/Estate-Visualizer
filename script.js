var user = "notAdmin";   // or "User"
var isAdmin = (user === "Admin");


  // Button style & state
  var buttonStyle = isAdmin
    ? "background:#2b7cff; cursor:pointer;"
    : "background:#bdbdbd; cursor:not-allowed;";

  var buttonDisabled = isAdmin ? "" : "disabled";


// Initialize map
var map = L.map('map').setView([7.25, 5.19], 13,); // Akure, Nigeria

// Add Base layers
var baseLayers = {
  "Open Street Map" : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
  }),
  "Google Streets": L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps'
  }),
  "Hybrid": L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Hybrid',
      maxZoom: 25,        // Leaflet zoom limit
    maxNativeZoom: 19   // Real tile resolution
  }),
  "Satellite": L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google Satellite'
  }),
};
// 👉 ADD Google Hybrid as default
baseLayers["Hybrid"].addTo(map);

// Add layer control
L.control.layers(baseLayers).addTo(map);

// Function to return style based on Status attribute
//Define the colours first, to be used in legend
var statusColors = {
    "SOLD": "#ff4d4d",
    "NOT SOLD": "#66ff66"
};

function plotStyle(feature) {

    var status = feature.properties.Status;

    if (status === "SOLD") {
        return {
            color: "#742121ff",
            weight: 1,
            fillColor: statusColors["SOLD"],
            fillOpacity: 0.1
        };
    }

    if (status === "NOT SOLD") {
        return {
            color: "#084908ff",
            weight: 1,
            fillColor: statusColors["NOT SOLD"],
            fillOpacity: 0.1
        };
    }

    // Default style (in case Status is missing)
    return {
        color: "#333",
        weight: 1,
        fillColor: "#cccccc",
        fillOpacity: 0.5
    };
}

// DEFINE FUNCTIONS  FOR MOUSE HOVER AND CICK
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        //fillOpacity: 0.9
    });

    // Bring feature to front for better visibility
    layer.bringToFront();
}

//Reset polygon style when mouse leaves
function resetHighlight(e) {
    layoutLayer.resetStyle(e.target);
}

function onEachFeature(feature, layer) {

       const p = feature.properties;

    let popupContent;

    if (isAdmin) {
        // Editable access for Admin User
        popupContent = `
        <div style="min-width: 50vw">
            <b 
            style="text-align:center; text-transform: uppercase; font-size: 15px;">
            Plot : ${p.Plot}</b><br>
            <b
            style="text-align:center; text-transform: uppercase; font-size: 15px;">
            Size : ${p.Size}</b><br><br>
            
            <b>Status:</b><br>
            <input style="width:100%" class="edit-status" value="${p.Status ?? ''}"><br><br>

            <b>Price:</b><br>
            <input style="width:100%" class="edit-price" value="${p.Price ?? ''}"><br><br>

            <b>Plot Type:</b><br>
            <input style="width:100%" class="edit-type" value="${p.Plot_Type ?? ''}"><br><br>

            <b>Description:</b><br>
            <textarea style="width:100%" class="edit-desc" rows="3">${p.Description ?? ''}</textarea><br><br>

            <button class="save-btn" 
                data-id="${p.Id}"
                style="background:green;color:white;border:none;padding:6px 12px;border-radius:4px; display:block; margin:0 auto;">
                💾 SAVE
            </button>
        </div>`;
    } else {
        //READ ONLY Access for non Admin user
        popupContent = `
        <div style="min-width:180px">
            <b>Plot:</b> ${p.Plot}<br>
            <b>Size:</b> ${p.Size}<br>
            <b>Status:</b> ${p.Status}
        </div>`;
    }

    layer.bindPopup(popupContent);

    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: () => layer.openPopup()
    });
}




document.addEventListener("click", function (e) {
    if (!isAdmin) return;

    if (e.target.classList.contains("save-btn")) {

        const popup = e.target.closest("div");

        const data = {
            plot: popup.querySelector(".edit-plot").value,
            size: popup.querySelector(".edit-size").value,
            status: popup.querySelector(".edit-status").value
        };

        const id = e.target.dataset.id;

        console.log("Saving", id, data);

        // send to backend (Laravel)
    }
});





// Add Boundary layer
var boundaryLayer = L.geoJSON(boundary,{
    style:{
            color: "#ffffffff",
            weight: 1,
            fillColor: "#ffffffff",
            fillOpacity: 0.1
    }
}).addTo(map);


// Add Layout polygon layer
var layoutLayer = L.geoJSON(layout, {

  // Style polygons
  style: plotStyle,

  // Popup for each plot
  onEachFeature: onEachFeature
}).addTo(map);



// Zoom map to the layout extent
map.fitBounds(layoutLayer.getBounds());


var legend = L.control({ position: 'bottomright'});


legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<strong>Plot Status</strong><br>';
    div.innerHTML +=
        '<i style="background:#66ff66"></i> NOT SOLD<br>' +
        '<i style="background:#ff4d4d"></i> SOLD<br>';
    return div;
};

// Add legend to map
legend.addTo(map);


