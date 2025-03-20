export const getProduct = async () => {
    try {
        return await new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    products: [
                        {
                            id: 1,
                            name: "Product",
                            price: 1000,
                        },
                    ],
                });
            }, 2000);
        });
    } catch (error) {
        throw new Error("Failed to fetch products");
    }
};


export const getProduct2 = async (id) => {
    try {
        return await new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    products:
                    {
                        id: {id},
                        name: `Product ${id}`,
                        price: Math.floor(Math.random() * id * 1000),
                    },
                });
            }, 2000);
        });
    } catch (error) {
        throw new Error("Failed to fetch products");
    }
};
