import { useEffect, useState } from "react";
import TroiController from "../troi/troiController";
import TroiApiService from "troi-library";

export function useTroi(username: string, password: string) {
  // note: this pattern could lead to race conditions when password or username change
  const [troiController, setTroiController] = useState<
    TroiController | undefined
  >();
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const contoller = new TroiController();
    contoller
      .init(
        new TroiApiService({
          baseUrl: "https://digitalservice.troi.software/api/v2/rest",
          clientName: "DigitalService GmbH des Bundes",
          username,
          password,
        }),
        () => {
          setLoading(true);
        },
        () => {
          setLoading(false);
        },
      )
      .then(() => {
        setTroiController(contoller);
        setInitialized(true);
      });

    return () => {
      setInitialized(false);
      setTroiController(undefined);
    };
  }, [username, password]);

  return {
    troiController,
    loading: loading || !initialized,
    initialized,
  };
}
