// ES6 / TypeScript
import express from "express"
import axios from 'axios';
import FormData from 'form-data';
import { getSubtitles } from 'youtube-captions-scraper';
import path from 'path';
import fs from "fs"
const app = express()
const port = 3000
const __dirname = path.resolve();

app.use(express.static(__dirname + '/public'));

app.get('/download', (req, res) => {
  const filePath = '/path/to/output.txt';
  res.download(filePath);
});


var str = ""
const API_KEY = "1912d88a146f0952e1ecb4547b180d25"
app.use(express.json())
app.use(express.urlencoded({ extended: false }))




function GetSummarizedText(str) {




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


  return new Promise((resolve, reject) => {
    axios.post(apiUrl, formData, axiosConfig)
      .then(response => {
        // handle the API response
        resolve(response)
      })
      .catch(error => {
        // handle the API error
        reject(error)
      });
  })

}

function GetText(videoId) {

  return new Promise((resolve) => {
  getSubtitles({
    videoID: videoId, // youtube video id
    lang: 'en' // default: `en`
  }).then((captions) => {

    captions.forEach(function (obj) { str += obj.text });

    resolve(str)
    // create a new FormData object
  });
})
}




app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

app.post("/", async (req, res) => {
  let extractUrl = req.body.VideoLink
  let ind = extractUrl.indexOf('=')
  ind += 1
  let videoId = extractUrl.substr(ind, 11)

  console.log("hello1")
  let text,response
  try{
    text = await GetText(videoId)
  }catch(err){
    console.log(err)
  }

  console.log("hello2")
  try {
    
    console.log("hello3")
    response = await GetSummarizedText(text)
    
  }
  catch (error) {
    response=error
  }

  try{
    console.log("hello4")
    fs.writeFileSync('output.txt', response.data.summary)
    console.log('File saved successfully!');
    res.download(`${__dirname}/output.txt`);
  }
  catch(err)
  {

  }
  console.log("hello5")

})

app.listen(port, () => { console.log("server listening") })