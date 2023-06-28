const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Please Enter Product Name'],
        trim:true,
        maxLength:[100,'Product Name Cannot Exceed 100 Character']
    },
    price:{
        type: Number,
        required: [true,'Please Enter Product price'],
        trim:true,
        maxLength:[5,'Product Price Cannot Exceed 5 Character'],
        default:0.0
    },
    description:{
        type: String,
        required: [true,'Please Enter Product Description']
    },
    ratings:{
        type: Number,
        default: 0
    },
    images:[
        {
            public_id:{
                type:String,
                required:true 
            },
            url:{
                type:String,
                required:true
            },
            
        }
    ],
    category: {
        type:String,
        required:[true, 'Please Select Category For This Product'],
        enum:{
            values: [
                'Shirt',
                'T-shirt'
            ],
            message:'Please Select Correct Category For Product'
        }
    },
    seller:{
        type:String,
        rquired:[true, 'Please Enter Product Seller']
    },
    stock:{
        type:Number,
        required:[true, 'Please Enter Product Stock'],
        maxLength:[5, 'Product Stock Cannot Exceed 5 Character']
    },
    numOfReviews: {
        type:Number,
        default:0
    },
    reviews:[
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('product', productSchema);