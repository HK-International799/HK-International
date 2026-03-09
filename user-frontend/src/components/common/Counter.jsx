import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

export default function Counter({ end, label }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });

  return (
    <div ref={ref} className="text-center">
      <h3 className="text-4xl font-bold text-blue-600">
        {inView && <CountUp end={end} duration={2} />}
        +
      </h3>
      <p className="text-gray-500 mt-2">{label}</p>
    </div>
  );
}