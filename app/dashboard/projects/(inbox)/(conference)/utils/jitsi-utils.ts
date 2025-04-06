import { User } from "@/types/user"; 

const JITSI_MEET_DOMAIN = "meet.jit.si";

export const generateJitsiRoomName = (projectId: string, selectedMessage: string | null): string | null => {
  if (!projectId || !selectedMessage) return null;
  return `cloudcast-project-${projectId}-conversation-${selectedMessage}`.replace(/\s+/g, '-');
};

export const startJitsiCall = (projectId: string, selectedMessage: string | null, user: User | null) => {
  const roomName = generateJitsiRoomName(projectId, selectedMessage);

  if (roomName && user) {
    const jitsiMeetURL = `https://${JITSI_MEET_DOMAIN}/${roomName}?userName=${user.name}&userEmail=${user.email}`;
    window.open(jitsiMeetURL, "_blank", "noopener,noreferrer");
    console.log(`Opening Jitsi Meet in a new tab: ${jitsiMeetURL}`);
  }
};
