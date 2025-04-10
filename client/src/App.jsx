import { EmpiricaClassic } from "@empirica/core/player/classic";
import { EmpiricaContext } from "@empirica/core/player/classic/react";
import { EmpiricaMenu, EmpiricaParticipant } from "@empirica/core/player/react";
import React from "react";
import { Game } from "./Game";
import { ExitSurvey1 } from "./intro-exit/ExitSurvey1";
import { ExitSurvey2 } from "./intro-exit/ExitSurvey2";
import { ExitSurvey3 } from "./intro-exit/ExitSurvey3";
import { ExitSurvey4 } from "./intro-exit/ExitSurvey4";
import { ExitNoGame } from "./intro-exit/ExitNoGame";
import { Introduction } from "./intro-exit/Introduction";
import { Demo } from "./intro-exit/Demo";
import { MultiplayerInfo } from "./intro-exit/MultiplayerInfo";
import { Checks } from "./intro-exit/Checks"; 
import { MyConsent } from "./intro-exit/MyConsent";
import { MyPlayerForm } from "./intro-exit/MyPlayerForm";
import { MyFinished } from "./intro-exit/MyFinished";

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const playerKey = urlParams.get("participantKey") || "";

  const { protocol, host } = window.location;
  const url = `${protocol}//${host}/query`;

  function introSteps({ game, player }) {
        return [
      Introduction,
      Demo,
      MultiplayerInfo,
      Checks
    ];
  }

  function exitSteps({ game, player }) {
    return player.get("ended") === "game ended" ?
    [ExitSurvey1, ExitSurvey2, ExitSurvey3, ExitSurvey4] :
    [ExitNoGame]
  }

  return (
    <EmpiricaParticipant url={url} ns={playerKey} modeFunc={EmpiricaClassic}>
      <div className="h-screen relative">
        <EmpiricaMenu position="bottom-left" />
        <div className="h-full overflow-auto">
          <EmpiricaContext 
            playerCreate={MyPlayerForm}
            consent={MyConsent} 
            introSteps={introSteps} 
            exitSteps={exitSteps}
            finished={MyFinished}>
            <Game />
          </EmpiricaContext>
        </div>
      </div>
    </EmpiricaParticipant>
  );
}
