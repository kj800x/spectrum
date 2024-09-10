import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { ClientMessage, isSyncMessage, ServerSyncPayload } from "./protocol";
import { Connection } from "./states/Connection";
import { Lobby } from "./states/Lobby";
import { GameInitializing } from "./states/GameInitializing";
import { RoundCompleted } from "./states/RoundCompleted";
import { Results } from "./states/Results";
import { RoundPlaying } from "./states/RoundPlaying";
import { Debug } from "./components/Debug";

function useConnection() {
  const [connection, setConnection] = useState<WebSocket | null>(null);
  const [syncPayload, setSyncPayload] = useState<ServerSyncPayload | null>(
    null
  );

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(
        `ws://${window.location.hostname}:${window.location.port}`
      );
      ws.onopen = () => {
        console.log("connected");
        setConnection(ws);
      };
      ws.onclose = () => {
        console.log("disconnected");
        setConnection(null);
      };
      ws.onmessage = (event) => {
        console.log("message", event.data);
        try {
          const message = JSON.parse(event.data);
          if (isSyncMessage(message)) {
            setSyncPayload(message.payload);
          }
        } catch (e) {
          console.error("failed to parse message", e);
        }
      };
    };

    connect();
  }, []);

  const sendMessage = useCallback(
    (message: ClientMessage) => {
      connection?.send(JSON.stringify(message));
    },
    [connection]
  );

  const actions = useMemo(() => {
    return {
      createRoom({ nickname }: { nickname: string }) {
        sendMessage({ type: "create-room", nickname });
      },
      joinRoom({ code, nickname }: { code: string; nickname: string }) {
        sendMessage({ type: "join-room", code, nickname });
      },
      startGame() {
        sendMessage({ type: "start-game" });
      },
      submitPrompt({
        spectrumId,
        prompt,
      }: {
        spectrumId: string;
        prompt: string;
      }) {
        sendMessage({ type: "submit-prompt", spectrumId, prompt });
      },
      proposeValue({ value }: { value: number }) {
        sendMessage({ type: "propose-value", value });
      },
      readyUp() {
        sendMessage({ type: "ready-up" });
      },
      clearReady() {
        sendMessage({ type: "clear-ready" });
      },
      proceed() {
        sendMessage({ type: "proceed" });
      },
    };
  }, [sendMessage]);

  return {
    connection,
    actions,
    syncPayload,
  };
}

function App() {
  const { syncPayload, actions } = useConnection();

  if (!syncPayload) {
    return (
      <Connection
        onRoomCreate={({ nickname }) => {
          actions.createRoom({ nickname });
        }}
        onRoomJoin={({ nickname, code }) => {
          actions.joinRoom({ code, nickname });
        }}
      />
    );
  }

  switch (syncPayload.state.state) {
    case "lobby":
      return (
        <Lobby
          syncPayload={syncPayload}
          onGameStart={() => {
            actions.startGame();
          }}
        />
      );
    case "initializing": {
      return (
        <GameInitializing
          syncPayload={syncPayload}
          onSubmitPrompt={({ spectrumId, prompt }) => {
            actions.submitPrompt({ spectrumId, prompt });
          }}
        />
      );
    }
    case "round-playing": {
      return (
        <RoundPlaying
          syncPayload={syncPayload}
          onReadyUp={() => {
            actions.readyUp();
          }}
          onReadyClear={() => {
            actions.clearReady();
          }}
          onProposeValue={({ value }) => {
            actions.proposeValue({ value });
          }}
        />
      );
    }
    case "round-completed": {
      return (
        <RoundCompleted
          syncPayload={syncPayload}
          onProceed={() => {
            actions.proceed();
          }}
        />
      );
    }
    case "results": {
      return <Results syncPayload={syncPayload} />;
    }
    default:
      return <Debug>{syncPayload.state}</Debug>;
  }
}

export default App;
