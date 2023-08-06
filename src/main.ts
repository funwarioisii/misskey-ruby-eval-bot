/**
 * @fileoverview このファイルはMisskeyのStreaming APIを利用して、
 * Misskeyの投稿に含まれるRubyコードを実行し、その結果を返信するスクリプトです。
 */
import "dotenv/config";

import { v4 as uuidV4 } from "uuid";
import { onMention, reply } from "./misskey";
import { WebSocket } from "ws";
import { evalRuby } from "./eval";

const token = process.env.MISSKEY_TOKEN;

function main() {
  if (!token) {
    throw new Error("MISSKEY_TOKEN is not set");
  }

  const channelId = `main-${uuidV4()}`;
  const ws = new WebSocket(`wss://misskey.io/streaming?i=${token}`);

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        type: "connect",
        body: {
          channel: "main",
          id: channelId,
          params: {},
        },
      }),
    );
  };

  ws.onmessage = (event) => {
    try {
      onMention(event, async (note) => {
        const rubyCode = note.text?.match(/```ruby\n(.+)\n```/s)?.[1];
        if (!rubyCode) {
          return;
        }
        const result = evalRuby(rubyCode);
        await reply(note, result, token);
      });
    } catch (error) {
      console.error(error);
    }
  };

  ws.onerror = (error) => console.error(error);

  ws.onclose = () => {
    console.log("closed");

    // 5秒後に再接続
    setTimeout(() => {
      console.log("reconnecting...");
      main();
    }, 5000);
  };
}

main();
