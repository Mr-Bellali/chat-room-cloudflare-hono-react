import { Context, Hono } from 'hono'
import { html } from 'hono/html';
import { HTTPException } from "hono/http-exception";


const app = new Hono()

export class Chatroom {
  state: any;

  constructor (state: any, env: any) {
    /// The state object contains all of the Durable Object APIs 
    this.state = state
    this.state.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong"),
    );
  }

  // This is the main 'entry point' of our object
  async fetch(request: Request) {
    const pair = new WebSocketPair();
    this.state.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] })
  }

  /* WEBSOCKET EVENT HANDLERS */

  async webSocketMessage(ws: WebSocket, data: string) {
    console.log("Received message:", data);
    const { message } = JSON.parse(data);
    this.state.getWebSockets().forEach((ws: WebSocket) => {
      ws.send(JSON.stringify({ message }))
    })
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ){
    console.log("CLOSED", {ws, code, reason, wasClean});
  }

  async webSocketError(ws: WebSocket, error:any) {
    console.log("ERROR", error);
  }

}

app.get("/connect", async (c: Context) => {
  if (c.req.header("upgrade") !== "websocket") {
    throw new HTTPException(402);
  }
  const id = c.env.CHATROOM.idFromName("0")
  const chatroom = c.env.CHATROOM.get(id)
  return await chatroom.fetch(c.req.raw)
})




export default app


// app.get("/", (c) => {
//   return c.html(html`
//     <!doctype html>
//     <html lang="en">
//       <head>
//         <title>chatroom</title>

//         <script
//           src="https://unpkg.com/htmx.org@1.9.9"
//           integrity="sha384-QFjmbokDn2DjBjq+fM+8LUIVrAgqcNW2s0PjAxHETgRn9l4fvX31ZxDxvwQnyMOX"
//           crossorigin="anonymous"
//         ></script>
//         <script>
//             htmx.createWebSocket = function (src) {
//               const ws = new WebSocket(src);
//               setInterval(function () {
//                 if (ws.readyState === 1) {
//                   ws.send("ping");
//                 }
//               }, 20000);
//               return ws;
//             };
//           </script>
//         <script src="https://unpkg.com/htmx.org/dist/ext/ws.js"></script>
//       </head>
//       <body>
//         <main hx-ext="ws" ws-connect="/connect">
//           <h1>chatroom</h1>
//           <ul id="messages"></ul>
//           <form ws-send>
//             <input type="text" name="message" />
//             <button>send</button>
//           </form>
//         </main>
//       </body>
//     </html>
//   `);
// });