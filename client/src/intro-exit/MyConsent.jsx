import { Consent } from "@empirica/core/player/react";
import { isMobile } from 'react-device-detect';

export function MyConsent({ onConsent }) {
    if (isMobile) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Mobile Device Detected</h2>
          <p className="mb-4">This experiment requires a desktop or laptop computer to participate.</p>
          <p>Please return using a non-mobile device to continue.</p>
        </div>
      );
    }
    
    return (
      <Consent
        title="Do you consent?"
        text={
          <div className = "text-[10.6px] text-black text-left space-y-1.1">
            <p>
              By participating in this study, you are contributing to research conducted by cognitive scientists in the Department of Brain and Cognitive Science at MIT.
              There are neither specific benefits nor anticipated risks associated with participation in this study. Your participation in this study is completely voluntary, and you can withdraw at any time by simply exiting the study.
              You may decline to answer any or all of the following questions. Choosing not to participate or withdrawing will result in no penalty.
              Your anonymity is assured; the researchers who have requested your participation will not receive any personal information about you, and any information you provide will not be shared in association with any personally identifying information.
            </p>
            <p>
              If you have questions about this research, please contact the researchers by sending an email to <a href="mailto:smlevine@mit.edu">Sydney Levine</a>.
              These researchers will do their best to communicate with you in a timely, professional, and courteous manner.
              If you have questions regarding your rights as a research subject, or if problems arise which you do not feel you can discuss with the researchers, please contact the MIT Institutional Review Board.
            </p>
            <h3></h3>
            <p>
             <b>Voluntary Participation:</b> Your participation in this research is voluntary. You may discontinue participation at any time during the research activity. You may print a copy of this consent form for your records.
              By clicking the 'Yes' button below, I confirm that:
            </p>
            <ul className="list-disc list-inside">
              <li>I am age 18 or older.</li>
              <li>I have read and understand the information above.</li>
              <li>I want to participate in this research and continue with the experiment.</li>
            </ul>
          </div>
        }
        buttonText="Yes"
        onConsent={onConsent}
      />
    );
  }