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

		connection.denon.on('connected', () => {
			this.status('Connected');
		});
		
		connection.denon.on('disconnected', () => {
			this.status('Disconnected');
		});
		
		
		connection.denon.on('raw', data => {
			this.send({
				payload: {
					event: 'raw',
					data: data
				}
			});
		});

		this.on('close', () => {
			this.status('Disconnected');
		});
	};

	RED.nodes.registerType("denon-in", DenonInNode);
}

module.exports = DenonIn;