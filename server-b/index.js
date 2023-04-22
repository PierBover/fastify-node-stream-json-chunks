import Fastify from 'fastify';
import stream from 'stream';

const fastify = Fastify({
	logger: true
});

fastify.get('/', async function (request, reply) {
	// create the stream
	var buffer = new stream.Readable();
	buffer._read = ()=>{};

	let times = 0, interval;

	function sendChunk () {
		console.log('Server B', 'send chunk');
		buffer.push(JSON.stringify({
			chunkNumber: times,
			timestamp: Date.now()
		}));

		times ++;

		if (times >= 10) {
			clearInterval(interval);
			// close the stream
			buffer.push(null);
		}
	}

	// fill the buffer once so that it's not empty when replying
	// otherwise we will get a "stream closed prematurely" error
	sendChunk();

	interval = setInterval(() => {
		sendChunk();
	}, 1000);

	reply.header('content-type', 'application/json; charset=UTF-8');
	reply.send(buffer);
});


fastify.listen({port: 3333}, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
});