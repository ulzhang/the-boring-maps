import Parser from 'html-react-parser';

type DistanceProps = {
    legBase: google.maps.DirectionsLeg;
    legStart: google.maps.DirectionsLeg;
    legEnd: google.maps.DirectionsLeg;
};

export default function TunnelDistance({ legBase, legStart, legEnd }: DistanceProps) {
  if (!legBase.distance || !legBase.duration || !legBase.duration_in_traffic) return null;
  if (!legStart.distance || !legStart.duration || !legStart.duration_in_traffic) return null;
  if (!legEnd.distance || !legEnd.duration || !legEnd.duration_in_traffic) return null;

  const sumOfStartAndEndInMinutes = Math.floor((legStart.duration_in_traffic.value + legEnd.duration_in_traffic.value) / 60);
  const tunnelDurationText = (sumOfStartAndEndInMinutes + 5) + " min"

  return (
    <div>
      <p>
        Traveling via Car through regular roadways from <span className="highlight">{legBase.start_address}</span> to <span className="highlight">{legBase.end_address}</span>
        would take{" "}
        <span className="highlight">{legBase.duration_in_traffic.text}</span>.
      </p>
      
      
      <p>
        Travelling via Tunnels, enter starting station at <span className="highlight">{legStart.end_address}</span>
        and traveling to exiting station at <span className="highlight">{legEnd.start_address}</span>
        would take{" "}
        <span className="highlight">{tunnelDurationText}</span>.
      </p>

      <ol>
        {legStart.steps.map((step, index) => {
          return  <li
                    key={"s"+index}
                  >
                    {Parser(step.instructions)} {"("}{step.distance?.text}{" | "}{step.duration?.text}{")"}
                  </li>

        })}
        
        <li><b>TAKE THE TUNNEL</b> (5 mi | 5 min)</li>

        {legEnd.steps.map((step, index) => {
          return  <li
                    key={"e"+index}
                  >
                    {Parser(step.instructions)} {"("}{step.distance?.text}{" | "}{step.duration?.text}{")"}
                  </li>

        })}
      </ol>
      
    </div>
  );
}
