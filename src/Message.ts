namespace FPS {

    export interface IMessageHandler {
        OnMessage( message: Message ): void;
    }

    export class Message {

        private static _subscriptions: { [code: string]: IMessageHandler[] } = {};

        public Code: string;
        public Sender: any;
        public Context: any;

        public constructor( code: string, sender: any, context?: any ) {
            this.Code = code;
            this.Sender = sender;
            this.Context = context;
        }

        public static Subscribe( code: string, handler: IMessageHandler ): void {
            if ( !Utilities.Exists( Message._subscriptions[code] ) ) {
                Message._subscriptions[code] = [];
            }
            Message._subscriptions[code].push( handler );
        }

        public static Unsubscribe( code: string, handler: IMessageHandler ): void {
            if ( !Utilities.Exists( Message._subscriptions[code] ) ) {
                console.warn( "Cannot unsubscribe from code '" + code + "' as it is not currently registered." );
            } else {
                let index = Message._subscriptions[code].indexOf( handler );
                if ( index !== -1 ) {
                    Message._subscriptions[code].splice( index, 1 );
                    if ( Message._subscriptions[code].length === 0 ) {
                        Message._subscriptions[code] = undefined;
                    }
                }
            }
        }

        public static Send( code: string, sender: any, context?: any ): void {
            if ( Utilities.Exists( Message._subscriptions[code] ) ) {
                let message = new Message( code, sender, context );
                for ( let handler of Message._subscriptions[code] ) {
                    handler.OnMessage( message );
                }
            }
        }
    }
}