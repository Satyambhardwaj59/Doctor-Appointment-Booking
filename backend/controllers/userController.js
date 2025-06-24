import jwt from 'jsonwebtoken'
import validator from 'validator';
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import { v2 as cloudinary } from 'cloudinary'



// API to register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid Email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password" })
        }

        // Hasing user password

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        };

        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ success: true, message: "Registation successful", token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// API for login user
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            res.json({ success: true, message: "Login successful", token });
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.user; // ✅ FROM req.user not req.body


        console.log("UserId from token:", userId);

        const userData = await userModel.findById(userId).select('-password');

        res.json({ success: true, userData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const {userId} = req.user;
        const { name, phone, address, dob, gender } = req.body;
        console.log(userId, name, phone, address, dob, gender );
        
        const imageFile = req.file;

        if (!name || !phone || !address || !dob || !gender) {
            res.json({ success: false, message: "Data missing" });
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender });

        if (imageFile) {

            // upload image to cloudinary 
            const imgaeUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'})
            const imageURL = imgaeUpload.secure_url

            await userModel.findByIdAndUpdate(userId, {image:imageURL});

        }

        res.json({success: true, message: "Profile Updated", updatedUser})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


export { registerUser, loginUser, getProfile, updateProfile }