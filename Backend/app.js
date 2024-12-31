import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";



const app = express()
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
 
const port = process.env.PORT||3000;
app.post('/getLocation', async (req, res) => { // Use POST here
    const { transcriptcityName:cityName } = req.body; // Extract cityName from the request body
    console.log('City name:', cityName);

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Provide the city name for the city "${cityName}" in JSON format. 
                        If the input contains two city names, return the result in JSON format with two fields:
                        - "city" for the from city name.
                        - "toCity" for the to the city name.
                        if there is one city the:
                        - "toCity" the city name
                        Ensure the output is valid JSON without additional formatting or comments.`;

        const result = await model.generateContent(prompt);
//jhansi to gina
//city jhasni
//tocitycity
        const responseText = await result.response.text();  
        console.log(responseText)
        const cleanedResponse = responseText
            .replace(/```json\n/, '') // Remove opening Markdown formatting
            .replace(/```\n/, '')    // Remove closing Markdown formatting
            .trim();                 // Trim any extra whitespace

        // Parse the cleaned string as JSON
        const parsedJson = JSON.parse(cleanedResponse);
        console.log(parsedJson)
        res.json({ location: parsedJson });
    } catch (error) {
        console.error('Error from Gemini API:', error);
        res.status(500).json({ error: 'Failed to get location from Gemini API' });
    }
});


app.listen(port, () => console.log(`http://localhost:${port}`));
