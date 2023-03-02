// ES6 / TypeScript
import express from "express"
import axios from 'axios';
import FormData from 'form-data';
import { getSubtitles } from 'youtube-captions-scraper';
import path from 'path';
import fs from "fs"
const app= express()
const port=3000


app.get('/download', (req, res) => {
  const filePath = '/path/to/output.txt';
  res.download(filePath);
});

var str=""
const API_KEY="1912d88a146f0952e1ecb4547b180d25"
const __dirname = path.resolve(); 
app.use(express.json())
app.use(express.urlencoded({extended:false}))
async function GetText(videoId) {
  getSubtitles({
    videoID: videoId, // youtube video id
    lang: 'en' // default: `en`
  }).then(async (captions) => {
    captions.forEach(function(obj) { str += obj.text });
    console.log(str.length)
    console.log("$$$$$$$$$$$$$$$$$$$$$$$")
      // create a new FormData object
    const formData = new FormData();
  
    // set the parameters in the FormData object
    formData.append('key', API_KEY);
    formData.append('txt', str);
    formData.append('limit', 70);
  
    // set the API endpoint URL
    const apiUrl = 'https://api.meaningcloud.com/summarization-1.0';
  
    // create the axios config object
    const axiosConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...formData.getHeaders()
      }
    };
    // send the POST request to the API endpoint
    axios.post(apiUrl, formData, axiosConfig)
      .then(response => {
        // handle the API response
        fs.writeFile('output.txt', response.data.summary, (err) => {
          if (err) throw err;
          console.log('File saved successfully!');
        });
      })
      .catch(error => {
        // handle the API error
        fs.writeFile('output.txt', error, (err) => {
          if (err) throw err;
          console.log('File saved successfully!');
        });
      });
  });
  
}




app.get("/",(req,res)=>{
  res.sendFile( __dirname + "/index.html")
})
app.post("/",async (req,res)=>{
  let extractUrl = req.body.VideoLink
  let ind=extractUrl.indexOf('=')
  ind+=1
  let videoId = extractUrl.substr(ind,11)
  console.log(videoId)
  await GetText(videoId)
  console.log(`${__dirname}/output.txt`)
  res.download(`${__dirname}/output.txt`);
})

app.listen(port,()=>{console.log("server listening")})















