let infoWindow;
let map;
let markers = [];

function initMap() {

    const la = { lat: 34.0700, lng: -118.4000};
    map = new google.maps.Map(document.getElementById('map'), {
      center: la,
      zoom: 13,
      mapId: 'ef023092446e5f98'
    });

    infoWindow = new google.maps.InfoWindow();

    //getStores();
}


const createMarker = (location, storeName, addy, storeNumber, open, phone) => {

    let html = `
    <div class="store-window">
      <div class="store-name">
        ${storeName}
      </div>
      <div class="store-open">
        ${open}
      </div>
      <div class="store-address">
        <div class="icon">
          <i class="fas fa-thumbtack"></i>
        </div>
        <span>
          ${addy}
        </span>
      </div>
      <div class="store-phone">
        <div class="icon">
          <i class="fas fa-phone"></i>
        </div>
        <span>
          <a href="tel:${phone}">${phone}</a>
        </span>
      </div>

    </div>
    `;

    let marker = new google.maps.Marker({
      position: location,
      map: map,
      label: `${storeNumber}`
    });

    google.maps.event.addListener(marker, "click", () => {
      infoWindow.setContent(html);
      infoWindow.open(map, marker);
    });

    markers.push(marker);

}

const searchLocationNear = (stores) => {
  stores.forEach((store, index) => {
    let latlng = new google.maps.LatLng(
      store.location.coordinates[1],
      store.location.coordinates[0]);
    let name = store.storeName;
    let address = store.addressLines[0];
    let open = store.openStatusText;
    let phoneNumber = store.phoneNumber;

    createMarker(latlng, name, address, index+1, open, phoneNumber);
  })
}

const onEnter = (e) => {
  if(e.key == 'Enter'){
    getStores();
  }
}

const getStores = () => {
  const zipCode = document.getElementById('zip-code').value;

  if(!zipCode){
    return;
  }

  const API_URL = 'http://localhost:3000/api/stores';
  const fullURL = `${API_URL}?zip_code=${zipCode}`;
  fetch(fullURL)
  .then((response) => {
    if(response.status == 200){
      return response.json();
    } else {
      throw new Error(response.status);
    }
  }).then((data) => {
    if(data.length > 0){
      clearLocations();
      searchLocationNear(data);
      displayStoreList(data);
      setOnClick();
    } else {
      noStoresFound();
    }
  })
}

const noStoresFound = () => {
  const html = `
    <div class="not-found">
      <span class="no-message">
          Stores not found!!
      </span>
    </div>
  `;

  document.querySelector('.stores-list').innerHTML = html;
}

const clearLocations = () => {
  infoWindow.close();
  for(var i = 0; i < markers.length; i++){
    markers[i].setMap(null);
  }
  markers.length = 0;
}

const displayStoreList = (stores) => {
  let storesHTML = '';
  stores.forEach((store, index) => {
    storesHTML += `
        <div class="store-container">
          <div class="store-container-background">
              <div class="store">
                  <div class="storeListAddress">
                      <span>${store.addressLines[0]}</span>
                      <span>${store.addressLines[1]}</span>
                  </div>
                  <div class="storeListPhone">${store.phoneNumber}</div>
              </div>
              <div class="storeListNumber">
                  <div class="store-number">
                      ${index+1}
                  </div>
              </div>
          </div>
        </div>
    `
  })

  document.querySelector('.stores-list').innerHTML = storesHTML;
}

const setOnClick = () => {
  let storeElement = document.querySelectorAll('.store-container');

  storeElement.forEach((elem, index) => {
    elem.addEventListener('click', () => {
      google.maps.event.trigger(markers[index], 'click');
    })
  })
}
