import { IMessage } from "./IMessage";

export interface IMessageHandler {
    OnMessage( message: IMessage ): void;
}