import { Redis } from 'ioredis'

export const cache = new Redis({
  port: 6379,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: () => process.env.REDIS_RECONNECTION_PERIOD,
  tls: {}
})

export const get = async (key) => {
  try {
    const value = await cache.get(key)
    return value
  } catch (err) {
    console.error(err)
    return null
  }
}

export const set = async (key, value) => {
  try {
    const result = await cache.set(key, value)
    return result
  } catch (err) {
    console.error(err)
    return null
  }
}

export const del = async (key) => {
  try {
    const result = await cache.del(key)
    return result
  } catch (err) {
    console.error(err)
    return null
  }
}

export const lrange = async (key, startIndex, endIndex) => {
  try {
    const result = await cache.lrange(key, startIndex, endIndex)
    return result.length ? result : null
  } catch (err) {
    console.error(err)
    return null
  }
}

export const lpush = async (key, value) => {
  try {
    const result = await cache.lpush(key, value)
    return result
  } catch (err) {
    console.error(err)
    return null
  }
}

export const rpop = async (key) => {
  try {
    const result = await cache.rpop(key)
    return result
  } catch (err) {
    console.error(err)
    return null
  }
}

export const setnx = async (key, value) => {
  try {
    const lockSet = await cache.setnx(key, value)
    return lockSet ? 1 : 0
  } catch (err) {
    console.error(err)
    return null
  }
}

export const exists = async (key) => {
  try {
    const isExist = await cache.exists(key)
    return isExist
  } catch (err) {
    console.error(err)
    return null
  }
}

export const executeLuaScript = async (luaScript, keys, args) => {
  try {
    const result = await cache.eval(luaScript, keys.length, ...keys, ...args)
    return result
  } catch (err) {
    console.error(err)
    return null
  }
}

export const getKeys = async (pattern) => {
  try {
    const results = await cache.keys(pattern)
    return results.length > 0 ? results : null
  } catch (err) {
    console.error(err)
    return null
  }
}

export const deleteKeys = async (keys) => {
  try {
    return keys && keys.length > 0 ? await cache.del(...keys) : null
  } catch (err) {
    console.error(err)
    return null
  }
}
