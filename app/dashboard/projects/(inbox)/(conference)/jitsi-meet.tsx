import { useUser } from "@/context/user-context";
import React, { useEffect, useState } from "react";

interface JitsiMeetProps {
  roomName: string;
}

const JitsiMeet = ({ roomName }: JitsiMeetProps) => {
  const { session } = useUser();

  const [jwtToken, setJwtToken] = useState("");

  useEffect(() => {
    if (session) {
      setJwtToken(session.access_token);
    }
  }, [session]);

  if (!jwtToken) {
    return <div>Loading...</div>;
  }

  return (
    <iframe
      src={`https://meet.jit.si/${roomName}?jwt=${jwtToken}`} // Pass the JWT token to the meeting URL
      style={{
        width: "100%",
        height: "600px",
        border: "0px",
        borderRadius: "8px",
      }}
      allow="camera; microphone; fullscreen; display-capture"
      title="Jitsi Video Call"
    />
  );
};

export default JitsiMeet;
