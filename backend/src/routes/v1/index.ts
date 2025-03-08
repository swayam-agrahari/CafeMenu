import e, { Router } from "express";
import { client } from "../../utils/client";
import { ItemSchema, OrderSchema } from "../../utils";
import { ParseStatus } from "zod";


export const router = Router();


//getting the menu
router.get('/menu',async (req,res) =>{
    console.log("e hit")
    const response = await client.items.findMany({})
    if(!response){
        console.log("NO response")
        res.status(400).json({
            message:"No items found"
        })
    }
    
    res.status(200).json({
        items:response
    })
})


//placing an order
router.post('/orders/',async (req,res) =>{
    const parsedResponse = OrderSchema.safeParse(req.body);
    if(!parsedResponse.success){
        res.status(400).json({
            message:"Validation failed"
        })
        return
    }
    const tableId = parsedResponse.data.tableId;
    if(!tableId){
        res.status(400).json({
            message:"No table found"
        })
        return
    }
    let placedOrder = await client.$transaction(async ()=>{
        //transaction for creating order

        //creating order
        const order = await client.orders.create({
            data:{
                tableId:tableId,
                totalCost:parsedResponse.data?.totalCost,
            }
        })

        const cartItems = await client.cart.createMany({
            data:parsedResponse.data.cartItems.map((item) =>({
                orderId:order.orderId,
                itemId:item.itemId,
                quantity:item.quantity
            }))
        })

        console.log("order added")
        return order.orderId
        
    })
    res.status(200).json({
        orderId: placedOrder
    })
})

//item with itemId
router.get('/item',async (req,res) =>{
    const itemId = Number(req.query.id);
    if(!itemId){
        res.status(400).json({
            message:"No item id found"
        })
        return
    }

    try {
        const response = await client.items.findFirst({
            where:{
                itemId:itemId
            }
        
        })
        if(!response){
            res.status(400).json({
                message:"No item found"
            })
        }
        res.status(200).json({
            item:response
        })
    } catch (error) {
        console.log("Error getting item",error)
    }
})


//items with category
router.get('/category/:cat',async (req,res) =>{
    const categoryName=req.params.cat

    if(!categoryName || Array.isArray(categoryName)){
        res.status(400).json({
            message:"No such category found"
        })
        return
    }
    const response = await client.items.findMany({
        where:{
            category:categoryName
        }
    })

    if(!response){
        res.status(400).json({
            message:"No item with that category found"
        })
    }
    res.status(200).json({
        items:response
    })
})


//routes for getting category
router.get('/getCategories',async (req,res) =>{
    console.log("Cat hit")
    const response = await client.category.findMany({})
    if(!response){
        console.log("NO response")
        res.status(400).json({
            message:"No categories found"
        })
    }
    console.log(response)
    res.status(200).json({
        categories:response
    })
})

router.post("/userAuth",async(req,res)=>{
    const username=req.body.username
    const password=req.body.password
    const response=await client.users.findFirst({
        where:{
            username:username
        }
    })
    if(response!=null){
        if(password==response.password){
            res.status(200).json({message:"Succesfully Logged In"})
        }else{
            res.status(400).json({message:"Incorrect Password"})
        }
    }else{
        res.status(400).json({massage:"User Not Found"})
    }
 })

 router.post('/addItem',async (req,res) =>{
    console.log("item hit")
    const parsedResponse = ItemSchema.safeParse(req.body);
    console.log(parsedResponse,req.body)
    if(!parsedResponse.success){
        res.status(400).json({
            message:"Validation failed"
        })
        return
    }

    let Item = await client.$transaction(async ()=>{
        const item = await client.items.create({
            data:{
                name:parsedResponse.data.name,
                image:parsedResponse.data.image,
                bio:parsedResponse.data.bio,
                availability:true,
                category:parsedResponse.data.category,
                subcategory:parsedResponse.data.subcategory,
                cost:parsedResponse.data.cost,
                isvegan:true,
            }
        })
        
    })
    res.status(200).json({
        message:"Item Has Been Added"
    })
})

router.get('/orders',async (req,res) =>{
    console.log("orders hit")
    const ordersres = await client.orders.findMany({})
    if(!ordersres){
        console.log("NO response")
        res.status(400).json({
            message:"No Orders found"
        })
    }
    const itemsordersres = await client.cart.findMany({})
    if(!itemsordersres){
        console.log("NO response")
        res.status(400).json({
            message:"No items_orders found"
        })
    }
    res.status(200).json({
        orders:ordersres,
        items:itemsordersres

    })
})
router.get('/allitems',async (req,res) =>{
    console.log("aa hit")
    const response = await client.items.findMany({})
    if(!response){
        console.log("NO response")
        res.status(400).json({
            message:"No items found"
        })
    }
    const newres:{[key:number]:string}={}
    for(let g in response){
        newres[response[g].itemId]=response[g].name
    }
    console.log(newres)
    res.status(200).json({
        items:newres
    })
})
router.get("/deleteItem/:id",async(req,res)=>{
    console.log("delete hit")
    const resDelete=await client.cart.deleteMany({
        where: { orderId: Number(req.params.id) }
    });
    if(!resDelete){
        res.status(400).json({
            message:"Failed To Delete"
        })
    }
    const response=await client.orders.delete({
        where:{
            orderId:Number(req.params.id)
        }
    })
    if(!response){
        res.status(400).json({
            message:"Failed To Delete"
        })
    }
    res.status(200).json({
        message:"Order Has Been Removed"
    })
})
router.post("/changeItem",async(req,res)=>{
    console.log("update Hit")
    const item=req.body
    const response=await client.items.update({
        where:{
            itemId:item.itemId
        },  
        data:{
            name:item.name,
            bio:item.bio,
            cost:item.cost,
            image:item.image,
            category:item.category,
            subcategory:item.subcategory,
            isvegan:item.isvegan,
            availability:item.availability
        }
    })
    if(!response){
        res.status(400).json({message:"Could Not Update Item"})
    }
    res.status(200).json({message:"Succesfully Updated"})

})