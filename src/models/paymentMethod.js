import mongoose from 'mongoose';
const { Schema } = mongoose;

const paymentSchema = new Schema ({
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true
    },
    method: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    reference: {
        type: String,
    },
   timestamps: true 

})

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;