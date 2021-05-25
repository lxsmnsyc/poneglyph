import { ServerSideContext } from "poneglyph";

export default function index(ctx: ServerSideContext): void {
  ctx.response.statusCode = 200;
  ctx.response.setHeader('Content-Type', 'application/json');
  ctx.response.end(JSON.stringify({
    message: 'Hello World',
  }));
}
