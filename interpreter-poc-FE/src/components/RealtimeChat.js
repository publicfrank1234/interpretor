import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import realtimeService from "../services/RealtimeAPISingleton";
import { addMessage } from "../store/chatSlice";

const RealtimeChat = () => {
  const dispatch = useDispatch();
  const history = useSelector((state) => state.chat.history);

  useEffect(() => {
    const transcriptionHandler = (data) => {
      const transcript = data.transcript;
      console.log("Transcription received:", transcript, realtimeService);

      // const translationInstruction = `Please translate the following text into English:"${transcript}"`;
      // [TODO] Trigger a translation request or enable multi modal outputs
      // realtimeService.sendEvent({
      //   type: "response.create",
      //   response: {
      //     modalities: ["text"],
      //     instructions: translationInstruction,
      //   },
      // });

      dispatch(
        addMessage({
          type: "chat-text",
          content: transcript,
          timestamp: Date.now(),
        })
      );
    };

    const responseTextHandler = (data) => {
      console.log("Translation response received:", data.text);
    };

    realtimeService.connect().then(() => {
      console.log("Realtime service connected.");
      realtimeService.on(
        "conversation.item.input_audio_transcription.completed",
        transcriptionHandler
      );
      realtimeService.on("response.text.done", responseTextHandler);
    });

    return () => {
      realtimeService.off(
        "conversation.item.input_audio_transcription.completed",
        transcriptionHandler
      );
      realtimeService.off("response.text.done", responseTextHandler);
    };
  }, [dispatch]);

  return (
    <div>
      {history.map((entry, index) => (
        <div key={index}>
          <strong>{entry.type}</strong>:{" "}
          {entry.type === "audio" ? (
            <audio src={entry.content} controls />
          ) : (
            entry.content
          )}
          <em>{new Date(entry.timestamp).toLocaleTimeString()}</em>
        </div>
      ))}
    </div>
  );
};

export default RealtimeChat;
