import { useTroi } from "~/troi/useTroi.hook";
import { LoadingOverlay } from "./LoadingOverlay";

interface Props {
  username: string;
  password: string;
}

export default function Troi(props: Props) {
  const { troiController, loading, initialized } = useTroi(
    props.username,
    props.password,
  );

  return (
    <div>
      {loading && <LoadingOverlay message={"Please wait..."} />}

      <section className="p-4">
        <a
          className="angie-link"
          href="https://digitalservicebund.atlassian.net/wiki/spaces/DIGITALSER/pages/359301512/Time+Tracking"
          target="_blank"
        >
          Read about how to track your time in confluence
        </a>
      </section>

      <section className="mt-8 text-xs text-gray-600">
        <p>
          Project not showing up? Make sure it's available in Troi and marked as
          a "favorite".
        </p>
      </section>
    </div>
  );

  return <div>TEST</div>;
}
