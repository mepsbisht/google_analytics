const { google } = require('googleapis');
const fs = require('fs');
const fetch = require('node-fetch');

const keyFile = "./active-bird-407310-fb0ffb54b23a.json";
const key = JSON.parse(fs.readFileSync(keyFile));

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/analytics.edit']
);

const createGa4Property = async (req,res)=>{
    const propertyDetails = {
      requestBody: {
        displayName: req.body.propertyName,
        parent: `accounts/${req.body.accountId}`,
        timeZone: 'America/Los_Angeles'
      },
    };
  
    jwtClient.authorize((err, tokens) => {
      if (err) {
        console.error('Error authenticating:', err);
        res.status(500).send('Error authenticating');
        return;
      }
  
      const analytics = google.analyticsadmin({
        version: 'v1alpha',
        auth: jwtClient,
      });
      
      analytics.properties.create(propertyDetails, (err, response) => {
        if (err) {
          console.error('Error creating GA4 property:', err);
          res.status(500).send('Error creating GA4 property ', err.message);
          return;
        }
  
        console.log("🚀 ~ file: index.js:54 ~ analytics.properties.create ~ response:", response)
        res.status(200).json(response.data);
      });
    });
  }


  const createDataStream = async (req,res)=>{
      const { propertyId } = req.body;
      jwtClient.authorize(async function (err, tokens) {
        if (err) {
          console.error('Error authorizing JWT client:', err);
          return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
      try {
        const response = await fetch(
          `https://analyticsadmin.googleapis.com/v1beta/{parent=properties/${propertyId}}/dataStreams`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`,
              'Content-Type': 'application/json',
            }
            // body: JSON.stringify({
            //   name: `projects/-/locations/global/webDataStream`,
            // }),
          }
        );
    
        const responseData = await response.json();
        console.log("🚀 ~ file: googleAnalyticsController.js:68 ~ createDataStream ~ responseData:", responseData);
    
        if (response.ok) {
          // Data stream created successfully
          const measurementId = responseData.streamId; // Extract Measurement ID from the response
          return res.status(200).json({ success: true, measurementId });
        } else {
          // Error creating data stream
          return res.status(200).json({ success: false, error: responseData.error.message });
        }
      } catch (error) {
        console.error('Error creating data stream:', error.message);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
    })
  }


  module.exports = { createGa4Property, createDataStream }