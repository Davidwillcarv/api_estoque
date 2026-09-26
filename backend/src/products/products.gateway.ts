import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ProductsGateway {
  @WebSocketServer()
  server: Server;

  notifyProductUpdate(data: any) {
    this.server.emit('productsUpdated', data);
  }
}