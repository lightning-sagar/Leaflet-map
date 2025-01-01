import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
// here is the logic
//as the transcript pass there will be 3 varivable route,zoom in,show area
//ask gemini what is it about if route then set it 1 and give the json
//show the route then var =1 and give the city name
//zoom in or out... var = 1 and is it zoom in left or right or out 


const app = express()
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
 
const port = process.env.PORT||3000;
app.post('/getLocation', async (req, res) => {  
    const { transcriptcityName,userLocation } = req.body; 
    console.log('City prompt:', transcriptcityName);
 
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Analyze the user's input and determine the intent ${transcriptcityName}. Based on the intent, create a JSON object in the following format:

        {
            "route": { isroute: 0,{} },
            "area": { isarea: 0,{} },
            "zoom": { iszoom: 0,{} },
            "nearby":{isnearby:0,{}}
        }
        
        ### Rules:
        1. **Single Condition**: 
           Only one condition (route, area, or zoom) will be true at any given time.
        
        2. **Route Detection**:
           - If the input mentions two city names (e.g., "from CityA to CityB"), include:
             "route":{
               "isroute": 1,
               "route": {
                 "from": "CityA",
                 "to": "CityB"
               }
             }
            "area": { isarea: 0 },
            "zoom": { iszoom: 0 }
           - If the input mentions one city name (e.g., "to CityA"), include:
             "route":{
               "isroute": 1,
               "route": {
                 "to": "CityA"
               }
             }
            "area": { isarea: 0 },
            "zoom": { iszoom: 0 }
        3. **Area Identification**:
           - If the input requests to show an area or mentions a city, include:
            "route": { isroute: 0 }
             "area":{
               "isarea": 1,
               "area": {
                 "city": "CityA"
               }
             }
            "zoom": { iszoom: 0 }
        
        4. **Zoom Operations**:
            -  If the input requests zoom actions (e.g., "zoom in," "zoom out," "left," or "right"), include:
              "route": { isroute: 0 }
              "area": { isarea: 0 },

              "zoom":{
                "iszoom": 1,
                "zoom": {
                  "dir": "in" / "out" / "left" / "right"
                }
              }
            - If the input requests zoom actions in specific city then inlcude:
              "route": { isroute: 0 }
              "area": { isarea: 0 },

              "zoom":{
                "iszoom": 1,
                "zoom": {
                  "dir": "in" / "out" / "left" / "right",
                  "area":"area" 
                }
              }
        5.  **Near By location"
            - If the user is asking for nearby locations (e.g., "nearby hospital," "nearby mall") near their current location that is ${userLocation} give me the nearby location thats an array inlcude name,address, include:
              "nearby":{
                "isnearby":"1",
               "details": {
                  "locationType": "hospital" / "mall" / "shop" / "food",
                  "results": [
                    {
                      "name": "Name of the nearby location",
                      "address": "Complete address of the nearby location",
                    }
                  ]
                }
              }
        Ensure that the JSON object contains only the relevant sections based on the input intent. Do not include other sections or unused keys. Provide the output in valid JSON format without additional formatting or comments.`;
        

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();  
        console.log(responseText)
        const cleanedResponse = responseText
            .replace(/```json\n/, '') 
            .replace(/```\n/, '')     
            .trim();                  

        const parsedJson = JSON.parse(cleanedResponse);
        console.log(parsedJson)
        res.json(parsedJson)
    } catch (error) {
        console.error('Error from Gemini API:', error);
        res.status(500).json({ error: 'Failed to get location from Gemini API' });
    }
});


app.listen(port, () => console.log(`http://localhost:${port}`));
