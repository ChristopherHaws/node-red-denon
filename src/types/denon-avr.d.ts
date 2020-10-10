declare module 'denon-avr' {
	export default class {
		constructor(transport: denon.transports.Transport);
		public on(eventName: string, callback: () => void): any;
	}

	export namespace denon.transports {
		export interface Transport {}

		export interface TelnetTransportProps {
			host: string,
			debug?: boolean
		}
	
		export class telnet implements Transport {
			constructor(props: TelnetTransportProps);
		}
	}

	// export class Transports {
	// 	public static telnet: Transport;
	// }

	
}