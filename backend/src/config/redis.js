const {createClient} =  require('redis');


const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'neolight-cobaltish-pine-57971.db.redis.io',
        port: 11289
    }
});


module.exports = redisClient;

