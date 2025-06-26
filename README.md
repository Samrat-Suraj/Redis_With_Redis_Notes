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
        const cachedAddress = await redis.get(`user_address:${userId}`);
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

        // Fire-and-forget caching : ---- Agar cach nhi hai phale se to yeha pe aake check kr lega
        redis.set(`user_address:${userId}`, JSON.stringify(address), "EX", 3600)

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


3.controller but update redish when add new address(redis.del(`user_address:${userId}`))

```ts

export const addAddress = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.user
        const { pinCode, state, district, city, addressType, landmark } = req.body
        if (!pinCode || !state || !district || !city || !addressType || !landmark) {
            return res.status(200).json({ success: true, message: "All fields are required" })
        }
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        const newAddress = new Address({
            userId: userId,
            pinCode,
            state,
            district,
            city,
            addressType,
            landmark,
        })

        await newAddress.save()
        await User.findByIdAndUpdate(user._id, { $push: { address: newAddress._id } })
        redis.del(`user_address:${userId}`)
        return res.status(200).json({ success: true, message: "Address Added Successfully", address: newAddress })
    } catch (error: any) {
        console.log("Error In addAddress controller", error.message)
        return res.status(500).json({ success: false, message: "Internal server errror" })
    }
}
```
