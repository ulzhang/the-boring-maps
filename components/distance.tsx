import Parser from 'html-react-parser';

const commutesPerYear = 260 * 2;
const litresPerKM = 10 / 100;
const gasLitreCost = 1.5;
const litreCostKM = litresPerKM * gasLitreCost;
const secondsPerDay = 60 * 60 * 24;

type DistanceProps = {
  leg: google.maps.DirectionsLeg;
};

export default function Distance({ leg }: DistanceProps) {
  if (!leg.distance || !leg.duration) return null;
  if (!leg.duration_in_traffic) return null;

  const days = Math.floor(
    (commutesPerYear * leg.duration.value) / secondsPerDay
  );
  const cost = Math.floor(
    (leg.distance.value / 1000) * litreCostKM * commutesPerYear
  );

  return (
    <div>
      {/* <p>
        <span className="highlight">{leg.start_address}</span> is <span className="highlight">{leg.distance.text}</span> away
        from <span className="highlight">{leg.end_address}</span>. That would take{" "}
        <span className="highlight">{leg.duration.text}</span>.
      </p> */}

      <p>
        IN TRAFFIC, <span className="highlight">{leg.start_address}</span> is <span className="highlight">{leg.distance.text}</span> away
        from <span className="highlight">{leg.end_address}</span>. That would take{" "}
        <span className="highlight">{leg.duration_in_traffic.text}</span> each direction IN TRAFFIC.
      </p>

      <ol>
        {leg.steps.map((step, index) => {
          return  <li
                    key={index}
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
