import { useTroi } from "~/troi/useTroi.hook";

interface Props {
  username: string;
  password: string;
}

export default function Troi(props: Props) {
  const { troiController, loading, initialized } = useTroi(
    props.username,
    props.password,
  );

  return <div>TEST</div>;
}
