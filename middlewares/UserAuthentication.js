const axios = require('axios');
const authenticateUser = async (req, res, next) => {
    try {
      const tokenString = req.headers.authorization; // Get the token from the Authorization header
      const [, token] = tokenString.split(' ');

    //   console.log(token);
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Missing Token' });
      }
  
      const customerMeResponse = await axios.get(
        'https://rakmun-api.rakega.online/customer/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (customerMeResponse.data.success) {
        // If authentication is successful, attach user information to the request
        req.user = customerMeResponse.data.data.user;
        next(); // Proceed to the next middleware or route handler
      } else {
        res.status(401).json({ error: 'Unauthorized - Invalid Token' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  module.exports = authenticateUser;
