const cache = new Map();

function setCache(key, data, ttl = 300000) {
  cache.set(key, {
    data,
    expire: Date.now() + ttl,
  });
}

function getCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expire) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

module.exports = {
  setCache,
  getCache,
};
