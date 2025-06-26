# Add Redis in My Project

1. server.js
```ts
export const redis = new Redis({
    host : '',
    port : 11352,
    password : ""
})

redis.on("connect" , ()=>{
    console.log("Redis connected successfully")
})
```

3. controller
```ts
export const GetUserAddress = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.user;

        // Check Redis cache first :--- Phale Check krna hai kuyki agar cache hai phale se to ye aa jayesa aur sab niche ka code ruk jayega
        const cachedAddress = await redis.get(`user:add:${userId}`);
        if (cachedAddress) {
            return res.status(200).json({
                success: true,
                address: JSON.parse(cachedAddress),
                cached: true,
            });
        }

      
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const address = await Address.find({ userId: user._id });
        if (!address || address.length === 0) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        // Fire-and-forget caching : ---- Agar cach nhi hai phale to yeha pe aake check kr lega
        redis.set(`user:add:${userId}`, JSON.stringify(address), "EX", 3600)

        return res.status(200).json({
            success: true,
            address,
            cached: false,
        });

    } catch (error: any) {
        console.error("Error in GetUserAddress:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
```
