import { Mic, MicOff } from "lucide-react";
import React, { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const Speech = () => {
  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Start listening on Space key down
      if (e.key == "m" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!listening) {
          SpeechRecognition.startListening({ continuous: true });
        }
      } else {
        if (listening) {
          SpeechRecognition.stopListening();
        }
      }
    };

    // const handleKeyUp = (e: KeyboardEvent) => {
    //   // Stop listening on Space key up
    //   if (e.metaKey || e.ctrlKey) {
    //     e.preventDefault();
    //     if (listening) {
    //       SpeechRecognition.stopListening();
    //     }
    //   }
    // };

    document.addEventListener("keydown", handleKeyDown);
    // document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // document.removeEventListener("keyup", handleKeyUp);
    };
  }, [listening]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <button
      className="absolute mt-20 right-6 p-3 dark:bg-darkdarkbg bg-lightlightbg
      rounded-full border border-third dark:border-maincolor dark:hover:bg-darkbg hover:bg-lightbg z-50
      transition-all duration-300"
      onMouseDown={() => SpeechRecognition.startListening({ continuous: true })}
      onMouseUp={() => SpeechRecognition.stopListening()}
      onTouchStart={() =>
        SpeechRecognition.startListening({ continuous: true })
      }
      onTouchEnd={() => SpeechRecognition.stopListening()}
    >
      {listening ? <Mic /> : <MicOff />}
      {transcript}
    </button>
  );
};

export default Speech;
