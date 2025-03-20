// import { radis } from "../server.js"

export const getCachedData = (key) => async (req, res, next) => {
    let data = await radis.get(key)

    if (data) {
        console.log("Fetching From Redis")
        return res.json({
            products: JSON.parse(data)
        })
    }
    next()
}


export const rateLimiter = (limit , timer) => async (req, res, next) => {
    let clientId = req.ip
    let requestCount = await radis.incr(`${clientId} : request_count`)
    if (requestCount === 1) {
        await radis.expire(`${clientId} : request_count`, timer)
    }
    const ttl = await radis.ttl(`${clientId} : request_count`)
    if (requestCount > limit) {
        return res.status(429).json({
            message: `You have exceeded the request limit Please Try Again After ${ttl} sec`
        })
    }
    next()
}
