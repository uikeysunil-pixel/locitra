const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        companyName: {
            type: String,
            default: ""
        },
        plan: {
            type: String,
            default: "free"
        },
        emailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: {
            type: String
        },
        emailVerificationExpires: {
            type: Date
        },
        registerIP: {
            type: String
        },
        dailyScanUsed: {
            type: Number,
            default: 0
        },
        scanResetDate: {
            type: Date
        }
    },
    {
        timestamps: true
    })

/*
  Hash password before saving
  IMPORTANT: do NOT use next() in async middleware
*/
userSchema.pre("save", async function () {

    if (!this.isModified("password")) return

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)

})

/*
  Compare password
*/
userSchema.methods.matchPassword = async function (enteredPassword) {

    return await bcrypt.compare(enteredPassword, this.password)

}

module.exports = mongoose.model("User", userSchema)