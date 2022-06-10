import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  TrafficLayer,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";
import Places from "./places";
import Distance from "./distance";

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

export default function Map() {
  const [start, setStart] = useState<LatLngLiteral>();
  const [end, setEnd] = useState<LatLngLiteral>();
  const [directions, setDirections] = useState<DirectionsResult>();
  // const [directions, setDirections] = useState<Array<DirectionsResult>>([]);
  const mapRef = useRef<GoogleMap>();
  const center = useMemo<LatLngLiteral>(
    () => ({ lat: 36.13, lng: -115.15 }),
    []
  );
  const options = useMemo<MapOptions>(
    () => ({
      mapId: "b181cac70f27f5e6",
      disableDefaultUI: true,
      clickableIcons: false,
    }),
    []
  );
  const onLoad = useCallback((map) => (mapRef.current = map), []);

  useEffect(()=>{
    // console.log(directions)
  },[directions])

  const fetchDirections = (start: LatLngLiteral, end: LatLngLiteral) => {
    if (!start || !end) return;

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: start,
        destination: end,
        drivingOptions: {
          departureTime: getNextFriday(),
        },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result)
          // setDirections(d => [...d, result])
          return result
        }
      }
    );
    return;
  };

  const fetchAllDirections = (start: LatLngLiteral, end: LatLngLiteral) => {
    if (!start || !end) return;
    const baseCase = fetchDirections(start, end);

    const startCase = stations.map((station) => (
      fetchDirections(start, station.latlng)
    ));
    const endCase = stations.map((station) => (
      fetchDirections(station.latlng, end)
    ));

  }

  return (
    <div className="container">
      <div className="controls">
        <h1>Commute?</h1>
        <Places
          setLocation={(position) => {
            setStart(position);
            mapRef.current?.panTo(position);
          }}
        />
        {!start && <p>Enter starting destination.</p>}
        
        {(start) && 
        <>
          <Places
          setLocation={(position) => {
            setEnd(position);
            fetchAllDirections(start, position);
          }}
        />
          {!end && <p>Enter ending destination.</p>}
        </>
        }

        {/* {directions && <Distance leg={directions.routes[0].legs[0]} />} */}
      </div>
      <div className="map">
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
        >
          {directions && 
            <DirectionsRenderer
                key={directions.routes[0].overview_polyline}
                directions={directions}
                options={{
                  polylineOptions: {
                    zIndex: 50,
                    strokeColor: "#1976D2",
                    strokeWeight: 5,
                  },
                }}
              />
            // directions.map((direction) => {
            //   <DirectionsRenderer
            //     key={direction.routes[0].overview_polyline}
            //     directions={direction}
            //     options={{
            //       polylineOptions: {
            //         zIndex: 50,
            //         strokeColor: "#1976D2",
            //         strokeWeight: 5,
            //       },
            //     }}
            //   />
            // })
          }

          {stations &&
            stations.map((station) => (
              <Marker
                key={station.latlng.lat}
                position={station.latlng}
              />
            ))
          }


          {start && (
            <>
              <Marker
                key={start.lat}
                position={start}
                icon="https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
              />

              {end && (
                <Marker
                  key={end.lat}
                  position={end}
                  icon="https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
                />
              )}




              {/* <Circle center={start} radius={15000} options={closeOptions} />
              <Circle center={start} radius={30000} options={middleOptions} />
              <Circle center={start} radius={45000} options={farOptions} /> */}
            </>
          )}
          <TrafficLayer />
        </GoogleMap>
      </div>
    </div>
  );
}

const defaultOptions = {
  strokeOpacity: 0.5,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
};
const closeOptions = {
  ...defaultOptions,
  zIndex: 3,
  fillOpacity: 0.05,
  strokeColor: "#8BC34A",
  fillColor: "#8BC34A",
};
const middleOptions = {
  ...defaultOptions,
  zIndex: 2,
  fillOpacity: 0.05,
  strokeColor: "#FBC02D",
  fillColor: "#FBC02D",
};
const farOptions = {
  ...defaultOptions,
  zIndex: 1,
  fillOpacity: 0.05,
  strokeColor: "#FF5252",
  fillColor: "#FF5252",
};

const generateHouses = (position: LatLngLiteral) => {
  const _houses: Array<LatLngLiteral> = [];
  for (let i = 0; i < 100; i++) {
    const direction = Math.random() < 0.5 ? -2 : 2;
    _houses.push({
      lat: position.lat + Math.random() / direction,
      lng: position.lng + Math.random() / direction,
    });
  }
  return _houses;
};

const getNextFriday = () => {
  const date = new Date()
  const dayOfWeek = 4 // Thursday
  var resultDate = new Date(date.getTime());
  resultDate.setDate(date.getDate() + 7 + (7 + dayOfWeek - date.getDay()) % 7);
  resultDate.setHours(17, 0, 0)
  return resultDate;
}

// | STATION | LATLNG |
// | --- | --- |
// | LAS | 36.0876986,-115.1510303 |
// | LVCC | 36.1330633,-115.1641777 |
// | ALLEGIANT | 36.0908708,-115.1855109 |
// | DT LV | 36.1679265,-115.1620129 |

const stations: Array<{name: string, latlng:LatLngLiteral}> = [ 
  // {
  //   name: "LVCC",
  //   latlng: {lat: 36.1330633, lng: -115.1641777}
  // },
  // {
  //   name: "LVAIRPORT",
  //   latlng: {lat: 36.0876986, lng: -115.1510303}
  // },
  // {
  //   name: "ALLEGIANT",
  //   latlng: {lat: 36.0908708, lng: -115.1855109}
  // },
  // {
  //   name: "DTLV",
  //   latlng: {lat: 36.1679265, lng: -115.1620129}
  // },
];

const routes = {
  route: "LVCC",
  0: {
    name: "LVAIRPORT",
    time: 5
  },
  1: {
    name: "ALLEGIANT",
    time: 4
  },
  3: {
    name: "DTLV",
    time: 3
  }
}