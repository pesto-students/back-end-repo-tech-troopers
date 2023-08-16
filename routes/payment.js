const express = require("express");
const router = express.Router();
require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post("/", async(req, res, next)=>{
    try {
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                    price_data : {
                        currency: 'inr',
                        product_data : {
                            name: "test"
                        },
                        unit_amount: 1000
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: "http://localhost:8000/success.html",
            cancel_url: `http://localhost:8000/checkout.html`,
        });
        console.log({success_url, cancel_url});
        res.json({url: session.u})
    } catch(err) {
        next(err);
    }
})

router.get('/success',(req,res)=>{
    return res.json({message:"success"})
})

router.get('/cancel', (req, res) => {
    return res.json({ message: "cancel" })
})

module.exports = router;