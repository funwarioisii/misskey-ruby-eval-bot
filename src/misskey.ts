import type { MessageEvent } from "ws";
import fetch from "node-fetch";

// ref: https://misskey-hub.net/docs/api/entity/user.html
type User = {
  id: string;
  createdAt: string;
  username: string;
  host: string | null;
  name: string;
  onlineStatus: "online" | "active" | "offline" | "unknown";
  avatarUrl: string;
  avatarBlurhash: string;
};

// ref: https://misskey-hub.net/docs/api/entity/note.html
type Note = {
  id: string;
  createdAt: string;
  text: string | null;
  cw: string | null;
  user: User;
  userId: string;
  visibility: "public" | "home" | "followers" | "specified";
};

export function onMention(event: MessageEvent, callback: (note: Note) => void) {
  const data = JSON.parse(event.data.toString());
  if (!(data.type === "channel" && data.body.type === "mention")) {
    return;
  }
  const note: Note = data.body.body;
  callback(note);
}

export async function reply(note: Note, text: string, token: string) {
  const res = await fetch("https://misskey.io/api/notes/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visibility: "public",
      text,
      cw: null,
      i: token,
      replyId: note.id,
    }),
  });

  return res.ok;
}

export { Note, User };
