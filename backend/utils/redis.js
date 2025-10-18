import { createClient } from 'redis';

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.errorLogged = false;
  }

  async connect() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          lazyConnect: true
        }
      });

      this.client.on('error', (err) => {
        if (!this.errorLogged) {
          console.log('⚠️  Redis unavailable - running without cache');
          this.errorLogged = true;
        }
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
        this.errorLogged = false;
      });

      await this.client.connect();
    } catch (error) {
      console.log('⚠️  Redis unavailable - running without cache');
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  }

  async flushAll() {
    if (!this.isConnected) return false;
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('Redis flush error:', error);
      return false;
    }
  }
}

const redisService = new RedisService();
export default redisService;