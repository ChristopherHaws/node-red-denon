import { DenonAVR } from '@chaws/denon';
import * as NodeRed from 'node-red';

interface Properties {
	address: string;
	port?: number;
}

interface Credentials {
}

export interface DenonConnectionNode extends NodeRed.Node<Credentials> {
	instanceKey: string;
	state: 'connected' | 'disconnected';
	denon: DenonAVR;
}

interface NodeDef extends NodeRed.NodeDef, Properties { }

const DenonConnectionInitializer: NodeRed.NodeInitializer = function (RED) {
	const DenonConnectionNodeConstructor: NodeRed.NodeConstructor<DenonConnectionNode, NodeDef, Credentials> = function (nodeDef) {
		this.state = 'disconnected';
		this.denon = this.denon ?? new DenonAVR({
			host: nodeDef.address,
			port: nodeDef.port
		});

		RED.nodes.createNode(this, nodeDef);

		// this.denon.on('raw', (x) => {
		// 	this.send({
		// 		payload: {
		// 			event: 'raw',
		// 			data: x
		// 		}
		// 	});
		// });

		this.denon.connect().then(() => {
			this.state = 'connected';
		}).catch(() => {
			this.state = 'disconnected';
		})

		// this.on('input', (msg, send, done) => {
		// 	send(msg);
		// });

		this.on('close', () => {
			this.denon?.disconnect().then(() => {
				this.state = 'disconnected';
			});
		});
	};

	RED.nodes.registerType("denon-connection", DenonConnectionNodeConstructor);
}

module.exports = DenonConnectionInitializer;