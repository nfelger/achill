import { useEffect } from "react";

import TroiController from "../troi/troiController";
import TroiApiService from "troi-library";

interface Props {
  username: string;
  password: string;
}

export default function Troi(props: Props) {
  const troiController = new TroiController();

  useEffect(() => {
    const troiApi = new TroiApiService({
      baseUrl: "https://digitalservice.troi.software/api/v2/rest",
      clientName: "DigitalService GmbH des Bundes",
      username: props.username,
      password: props.password,
    });

    troiController
      .init(
        troiApi,
        () => {},
        () => {},
      )
      .then(() => {
        const positions = troiController.getProjects();
        console.log(positions);
        // await updateUI();
        // await getDefaultTasks();
        // hideLoadingSpinner();
      });
  }, []);

  return <div>TEST</div>;
}
