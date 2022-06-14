import Parser from 'html-react-parser';

type DistanceProps = {
    legStart: google.maps.DirectionsLeg;
    legEnd: google.maps.DirectionsLeg;
};

export default function TunnelDistance({ legStart, legEnd }: DistanceProps) {
  if (!legStart.distance || !legStart.duration || !legStart.duration_in_traffic) return null;
  if (!legEnd.distance || !legEnd.duration || !legEnd.duration_in_traffic) return null;

  return (
    <div>

      <p>
        FROM STARTING LOCATION, <span className="highlight">{legStart.start_address}</span> is <span className="highlight">{legStart.distance.text}</span> away
        from TUNNEL LOCATION AT <span className="highlight">{legStart.end_address}</span>. That would take{" "}
        <span className="highlight">{legStart.duration_in_traffic.text}</span> VIA TUNNEL.
      </p>
      <p>From TUNNEL TO TUNNEL, would take {"5"} minutes</p>
      <p>
        FROM TUNNEL DESTINATION, <span className="highlight">{legEnd.start_address}</span> is <span className="highlight">{legEnd.distance.text}</span> away
        from ENDING LOCATION <span className="highlight">{legEnd.end_address}</span>. That would take{" "}
        <span className="highlight">{legEnd.duration_in_traffic.text}</span> VIA TUNNEL.
      </p>

      <ol>
        {legStart.steps.map((step, index) => {
          return  <li
                    key={"s"+index}
                  >
                    {Parser(step.instructions)} {"("}{step.distance?.text}{" | "}{step.duration?.text}{")"}
                  </li>

        })}
        
        <li><b>TAKE THE TUNNEL</b> (5 MILES | 5 MINUTES)</li>

        {legEnd.steps.map((step, index) => {
          return  <li
                    key={"e"+index}
                  >
                    {Parser(step.instructions)} {"("}{step.distance?.text}{" | "}{step.duration?.text}{")"}
                  </li>

        })}
      </ol>
      
      {/* <p>
        That's <span className="highlight">{days} days</span> in your car each
        year at a cost of{" "}
        <span className="highlight">
          ${new Intl.NumberFormat().format(cost)}
        </span>
        .
      </p> */}
    </div>
  );
}
