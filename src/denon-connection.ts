import { DenonAVR } from '@chaws/denon';
import { EventEmitter } from 'events';
import * as NodeRed from 'node-red';

interface Properties {
	address: string;
	port?: number;
}

interface Credentials {
}

export interface DenonConnectionNode extends NodeRed.Node<Credentials> {
	instanceKey: string;
	connected: boolean;
	denon: DenonAVR;
	getClient: () => Promise<DenonAVR>;
	
	//FIXME: Add these overloads so users have type safty
	//on(event: 'connected', listener: () => void): this;
	//on(event: 'disconnected', listener: () => void): this;
}

interface NodeDef extends NodeRed.NodeDef, Properties { }

const DenonConnectionInitializer: NodeRed.NodeInitializer = function (RED) {
	const DenonConnectionNodeConstructor: NodeRed.NodeConstructor<DenonConnectionNode, NodeDef, Credentials> = function (nodeDef) {
		this.log('Initializing...');

		this.connected = false;
		this.denon = new DenonAVR({
			host: nodeDef.address,
			port: nodeDef.port
		});
		
		RED.nodes.createNode(this, nodeDef);

		this.denon.on('connected', () => {
			this.log('Connected');
			this.connected = true;
			this.emit('connected');
		});

		this.denon.on('disconnected', () => {
			this.log('Disconnected');
			this.connected = false;
			this.emit('disconnected');
		});

		this.getClient = async () => {
			this.log('Getting client');

			if (!this.connected) {
				this.log('Connecting...');
				await this.denon.connect();

				this.connected = true;
				this.log('Connected');
			}

			return this.denon;
		}
		
		this.on('close', () => {
			this.denon.disconnect().then(() => {
				this.log('Closed');
				this.connected = false;
				this.emit('disconnected');
			});
		});
	};

	RED.nodes.registerType("denon-connection", DenonConnectionNodeConstructor);
}

module.exports = DenonConnectionInitializer;