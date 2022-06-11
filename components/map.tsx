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
      mapId: "b181cac70f27f5e6",
      disableDefaultUI: true,
      clickableIcons: false,
    }),
    []
  );
  const onLoad = useCallback((map) => (mapRef.current = map), []);

  useEffect(()=>{
    if (directionsStartArr.length > 1) {
      var min = directionsEndArr.reduce(function(res, obj) {
        return (obj.routes[0].legs[0].duration.value < res.routes[0].legs[0].duration.value) ? obj : res;
      });   
      setDirectionsStart(min)
    }
  },[directionsStartArr])

  useEffect(()=>{
    if (directionsEndArr.length > 1) {
      var min = directionsEndArr.reduce(function(res, obj) {
        return (obj.routes[0].legs[0].duration.value < res.routes[0].legs[0].duration.value) ? obj : res;
      });    
      setDirectionsEnd(min)
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

  const fetchDirectionsStart = (start: LatLngLiteral, end: LatLngLiteral) => {
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
          setDirectionsStartArr(d => [...d, result])
          return result
        }
      }
    );
    return undefined;
  };

  const fetchDirectionsEnd = (start: LatLngLiteral, end: LatLngLiteral) => {
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
          setDirectionsEndArr(d => [...d, result])
          return result
        }
      }
    );
    return undefined;
  };


  const fetchAllDirections = () => {
    if (!start || !end) return;
    
    const baseCase = fetchDirectionsBase(start, end);

    const startCase = stations.map((station) => (
      fetchDirectionsStart(start, station.latlng)
    ));
    const endCase = stations.map((station) => (
      fetchDirectionsEnd(station.latlng, end)
    ));
  }

  return (
    <div className="container">
      <div className="controls" style={{overflowY: 'scroll', width: 400}}>
        <button
          onClick={()=>{
            setStart({lat:36.16916599, lng: -115.139832774})
            setEnd({lat: 36.0876986, lng: -115.1510303})
            start && mapRef.current?.panTo(start);
            fetchAllDirections();
          }}
        >
          Test
        </button>
        {/* <h1>Commute?</h1>
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
        } */}

        {/* {directionsArr && directionsArr.map((direction, index)=>{
          return (
            <>
              <h1>{direction.useCase}</h1>
              <Distance 
                key={index}
                leg={direction.result.routes[0].legs[0]}
              />  
            </>
          )
        })} */}

          {directionsBase && 
          <>
          <h1>Base</h1>
          <Distance 
            key={"base"}
            leg={directionsBase.routes[0].legs[0]}
          />  
          </>}
          {directionsStart && 
          <>
          <h1>Start</h1>
          <Distance 
            key={"start"}
            leg={directionsStart.routes[0].legs[0]}
          />  
          </>}
          {directionsEnd && 
          <>
          <h1>End</h1>
          <Distance 
            key={"end"}
            leg={directionsEnd.routes[0].legs[0]}
          />  
          </>}
        
      </div>
      <div className="map">
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
        >
          
            {/* {directionsArr && 
              directionsArr.map((direction) => {
                return (

                  <DirectionsRenderer
                  key={direction.result.routes[0].overview_polyline}
                  directions={direction.result}
                  options={{
                    polylineOptions: {
                      zIndex: 50,
                      strokeColor: "#1976D2",
                      strokeWeight: 5,
                    },
                  }}
                  />
                )
              })
            } */}

          {directionsBase && 
          <DirectionsRenderer
            key={"base"}
            directions={directionsBase}
            options={{
              polylineOptions: {
                zIndex: 50,
                strokeColor: "#1976D2",
                strokeWeight: 5,
              },
            }}
          />}
          {directionsStart && 
            <DirectionsRenderer
              key={"start"}
              directions={directionsStart}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#1976D2",
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
                  strokeColor: "#1976D2",
                  strokeWeight: 5,
                },
              }}
          />}

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