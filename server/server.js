import express from "express"
import { getProduct, getProduct2 } from "./api/product.js"
import Redis from "ioredis"
import { getCachedData, rateLimiter } from "./middleware/redis.js"
const app = express()


// Redis Connection
export const radis = new Redis({
    host: 'redis-19193.crce185.ap-seast-1-1.ec2.redns.redis-cloud.com',
    port: 19193,
    password: 'UyfyfHr1bzdWL7iMsC3VwWcTxkdikFBn'
})

radis.on("connect", () => {
    console.log("Redis Connected")
})

// Rate Limiting

app.get("/" , rateLimiter(5 , 60) , async(req,res) => {
    // Current IP Address - request count
    res.send("Hello World")
})

// Caching
app.get('/products', getCachedData("products"), async (req, res) => {
    let products = await getProduct();
    // await radis.set("products", JSON.stringify(products.products))
    await radis.setex("products", 20, JSON.stringify(products.products))
    res.json({
        products
    })

})

// Caching automatically Delete with TTL
app.get("/product/:id", async (req, res) => {
    let product = await radis.get(`product${req.params.id}`)
    if (product) {
        console.log("Fetching From Redis")
        return res.json({
            product: JSON.parse(product)
        })
    }

    product = await getProduct2(req.params.id)
    await radis.setex(`product${req.params.id}`, 20, JSON.stringify(product))
    res.json({
        product
    })
})

// Caching Delete Manually
app.get("/order/:id", async (req, res) => {
    let order = await radis.get(`order${req.params.id}`)

    await radis.del(`order${req.params.id}`) // Delete Manually

    await radis.set(`order${req.params.id}`, JSON.stringify(order))
    res.json({
        message: "Order Place Successfully , product id : " + req.params.id
    })
})



const PORT = 5000
app.listen(PORT, () => {
    console.log("Server Is running on ", PORT)
})
