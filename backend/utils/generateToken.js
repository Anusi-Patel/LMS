import jwt from "jsonwebtoken"

// Utility function to ensure expiresIn is a number
const getExpiresIn = () => {
  const expiresIn = process.env.JWT_EXPIRE
  if (!expiresIn) {
    return 3600 // Default to 1 hour if not set
  }
  
  // If it's a number string, convert to number
  if (/^\d+$/.test(expiresIn)) {
    return parseInt(expiresIn, 10)
  }
  
  // If it's a time string (e.g., '1h', '24h', '7d'), return as is
  return expiresIn
}

// Utility function to ensure JWT_SECRET exists
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables")
  }
  return secret
}

const generateToken = (id, options = {}) => {
  try {
    const secret = getJWTSecret()
    const expiresIn = options.expiresIn || getExpiresIn()
    
    const token = jwt.sign(
      { 
        id,
        iat: Math.floor(Date.now() / 1000),
        ...options.payload
      },
      secret,
      {
        expiresIn,
        algorithm: "HS256",
        ...options.jwtOptions
      }
    )

    return token
  } catch (error) {
    console.error("Token generation error:", error)
    throw new Error("Failed to generate token")
  }
}

export default generateToken

