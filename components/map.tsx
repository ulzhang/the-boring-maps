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
import { dir } from "console";

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

export default function Map() {
  const [start, setStart] = useState<LatLngLiteral>();
  const [end, setEnd] = useState<LatLngLiteral>();
  const [directions, setDirections] = useState<DirectionsResult>();
  const [directionsBase, setDirectionsBase] = useState<DirectionsResult>();
  const [directionsStart, setDirectionsStart] = useState<DirectionsResult>();
  const [directionsEnd, setDirectionsEnd] = useState<DirectionsResult>();
  const [directionsStartArr, setDirectionsStartArr] = useState<Array<DirectionsResult>>([]);
  const [directionsEndArr, setDirectionsEndArr] = useState<Array<DirectionsResult>>([]);
  const mapRef = useRef<GoogleMap>();
  const center = useMemo<LatLngLiteral>(
    () => ({ lat: 36.13, lng: -115.15 }),
    []
  );
  const options = useMemo<MapOptions>(
    () => ({
      mapId: "4f6a74f97c6cb648",
      disableDefaultUI: true,
      clickableIcons: false,
    }),
    []
  );
  const onLoad = useCallback((map) => (mapRef.current = map), []);
  const boringIcon: google.maps.Icon = {
    url: "https://images.squarespace-cdn.com/content/v1/6063b0835f68896079d7d643/1617895467119-ES2L55ABT0EWFFKS7BMZ/Loop%2BTunnel.png",  // url
    scaledSize: new google.maps.Size(50, 50), // scaled size
  };  

  useEffect(()=>{
    if (directionsStartArr.length > 1) {
      var min = directionsStartArr.reduce(function(res, obj) {
        return (obj!.routes[0]!.legs[0]!.duration!.value! < res!.routes[0]!.legs[0]!.duration!.value!) ? obj : res;
      });      
      setDirectionsStart(min);
      (start && mapRef.current?.panTo(start));
    }
  },[directionsStartArr])

  useEffect(()=>{
    if (directionsEndArr.length > 1) {
      var min = directionsEndArr.reduce(function(res, obj) {
        return (obj!.routes[0]!.legs[0]!.duration!.value! < res!.routes[0]!.legs[0]!.duration!.value!) ? obj : res;
      });    
      setDirectionsEnd(min);
      (start && mapRef.current?.panTo(start));
    }
  },[directionsEndArr])

  const fetchDirectionsBase = (start: LatLngLiteral, end: LatLngLiteral) => {
    if (!start || !end) return undefined;

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
          setDirectionsBase(result)
          return result
        }
      }
    );
    return undefined;
  };

  const fetchDirectionsTunnels = (start: LatLngLiteral, end: LatLngLiteral, station:LatLngLiteral) => {

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: start,
        destination: station,
        drivingOptions: {
          departureTime: getNextFriday(),
        },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirectionsStartArr(d => [...d, result])
          // directionsStartArr.current.push(result)
        }
      }
    );
    service.route(
      {
        origin: station,
        destination: end,
        drivingOptions: {
          departureTime: getNextFriday(),
        },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirectionsEndArr(d => [...d, result])
        }
      }
    );
      
  };

  const fetchAllDirections = () => {
    if (!start || !end) return;

    fetchDirectionsBase(start, end);

    for (const s of stations) {
      fetchDirectionsTunnels(start, end, s.latlng)
    }
  }

  return (
    <div className="container">
      <div className="controls" style={{overflowY: 'scroll', width: 400}}>
        <h1>The Boring Company Maps</h1>

        <button
          onClick={()=>{
            setStart({lat: 36.1330633, lng: -115.1641777});
            setEnd({lat: 36.0876986, lng: -115.1510303});
            fetchAllDirections();
          }}
        >
          Sample Directions
        </button> {"Triple click to zoom out. "}
        {"State mgmt needs to improved, refresh page when adding new directions"}
        
        <h1>Add your own directions</h1>
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
          }}
        />
          {!end && <p>Enter ending destination.</p>}

          {start && end && 
            <button
              onClick={fetchAllDirections}>
                Search
            </button>} {"Double click to zoom out"}
        </>
        
        }

          {directionsBase && directionsStart && directionsEnd && 
          <>
          <h1>Commute Information</h1>
          <Distance 
            key={directionsBase.routes[0].overview_polyline}
            legBase={directionsBase.routes[0].legs[0]}
            legStart={directionsStart.routes[0].legs[0]}
            legEnd={directionsEnd.routes[0].legs[0]}
          />  
          </>}
        
        {[

          "In early 2022, I was interviewing with Elon Musk's The Boring Company. ",
          "Although, I didn't get the job. (Ask me about the tragic interview story). ",
          "This side project is the result of asking myself if a tunnel system is actually viable. ",
          "By inputting two locations (in Las Vegas), this app checks for the base case and the tunnel case. ",
          "The base case is the default directions/duration by car on the road. ",
          "The tunnel case is if you took a route to the nearest proposed tunnel station. ",
          "Using Google Maps API, this will calculate the closest tunnel route. ",
          "See for yourself! "
        ]}
      </div>
      <div className="map">
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
        >

          {directionsBase && 
          <DirectionsRenderer
            key={"base"}
            directions={directionsBase}
            options={{
              polylineOptions: {
                zIndex: 50,
                strokeColor: "#8F00FF",
                strokeWeight: 5,
              }
            }}
          />}
          {directionsStart && 
            <DirectionsRenderer
              key={"start"}
              directions={directionsStart}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#4285F4",
                  strokeWeight: 5,
                },
              }}
          />}
          {directionsEnd && 
            <DirectionsRenderer
              key={"end"}
              directions={directionsEnd}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#4285F4",
                  strokeWeight: 5,
                },
              }}
          />}

          {stations &&
            stations.map((station) => (
              <Marker
                key={station.latlng.lat}
                position={station.latlng}
                icon={boringIcon}
                zIndex={999}
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
  {
    name: "LVCC",
    latlng: {lat: 36.1330633, lng: -115.1641777}
  },
  {
    name: "LVAIRPORT",
    latlng: {lat: 36.0876986, lng: -115.1510303}
  },
  {
    name: "ALLEGIANT",
    latlng: {lat: 36.0908708, lng: -115.1855109}
  },
  {
    name: "DTLV",
    latlng: {lat: 36.1679265, lng: -115.1620129}
  },
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