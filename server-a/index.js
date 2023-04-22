import Fastify from 'fastify';
import got from 'got';

const fastify = Fastify({
	logger: true
});

fastify.get('/', async function (request, reply) {

	const chunks = [];

	function streamPromise (stream) {
		return new Promise((resolve, reject) => {
			stream.on('data', (chunk) => {
				console.log('Server A', JSON.parse(Buffer.from(chunk).toString('utf8')));
				chunks.push(Buffer.from(chunk))
			});
			stream.on('error', (err) => reject(err));
			stream.on('end', () => resolve());
		})
	}

	await streamPromise(got.stream('http://127.0.0.1:3333/'));

	reply.send(`Received ${chunks.length} chunks of JSON`);
});


fastify.listen({port: 3000}, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
});