import bcrypt from 'bcryptjs';

// Function to hash the password using bcrypt hash method with gensalt
export const hashPassword = async (password) =>{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    return hashedPassword;
}

// Function to compare the password using bcrypt compare method
export const comparePassword = async (password, hashPassword)=>{
    const isMatch = await bcrypt.compare(password,hashPassword);
    return isMatch;
}