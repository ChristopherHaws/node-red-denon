import { NodeInitializer, NodeConstructor, NodeDef, Node  } from 'node-red';
import { DenonConnectionNode } from './denon-connection';

interface DenonInProperties {
	defKey: string;
	connection: string;
}

interface DenonCredentials {
}

interface DenonInNode extends Node<DenonCredentials> {
	instanceKey: string;
}

interface DenonInNodeDef extends NodeDef, DenonInProperties { }

const DenonIn: NodeInitializer = function (RED) {
	const DenonInNode: NodeConstructor<DenonInNode, DenonInNodeDef, DenonCredentials> = function (config) {
		RED.nodes.createNode(this, config);

		const connection = RED.nodes.getNode(config.connection) as DenonConnectionNode;
		this.status(!connection.connected ? 'Connected' : 'Connecting...');

		connection.on('connected' as any, () => {
			this.status('Connected');
		});
		
		connection.on('disconnected' as any, () => {
			this.status('Disconnected');
		});

		const run = async () => {
			try {	
				const client = await connection.getClient();
				this.status('Connected');

				client.on('raw', data => {
					this.send({ payload: { event: 'raw', data: data } });
				});
				
				client.on('mainZoneOn', () => {
					this.send({ payload: { event: 'mainZoneOn' } });
				});
	
				client.on('mainZoneOff', () => {
					this.send({ payload: { event: 'mainZoneOff' } });
				});
			} catch (err) {
				this.error('Failed to connect to denon receiver', err);
				this.status('Disconnected');
			}
		}

		run();

		this.on('close', () => {
			this.log('Closed');
			this.status('Disconnected');
		});
	};

	RED.nodes.registerType("denon-in", DenonInNode);
}

module.exports = DenonIn;