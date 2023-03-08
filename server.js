// ES6 / TypeScript
import express from "express"
import axios from 'axios';
import FormData from 'form-data';
import { getSubtitles } from 'youtube-captions-scraper';
import path from 'path';
import fs from "fs"
const app = express()
const __dirname = path.resolve();
import * as dotenv from 'dotenv'
dotenv.config()
const port = 3000

app.use(express.static(__dirname + '/public'));

app.get('/download', (req, res) => {
  const filePath = '/path/to/output.txt';
  res.download(filePath);
});


var str = ""
const API_KEY = process.env.API_KEY
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
       return resolve(response.data.summary)
      })
      .catch(error => {
        // handle the API error
        return reject(new Error(error))
      });
  })

}

function GetText(videoId) {

  return new Promise((resolve, reject) => {
    getSubtitles({
      videoID: videoId, // youtube video id
      lang: 'en' // default: `en`
    }).then((captions) => {

      captions.forEach(function (obj) { str += obj.text });

      return resolve(str)
      // create a new FormData object
    }).catch(error => {
      // handle the API error
      console.log("$$$$$$$$$$$$$$$$$")
      return reject(new Error(error))
    });;
  })
}

async function errorHandler() {
  fs.writeFileSync('output.txt', "NO Captions")
}



app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

app.post("/", async (req, res) => {
  let extractUrl = req.body.VideoLink
  let ind = extractUrl.indexOf('=')
  console.log(ind)
  ind += 1
  let videoId = extractUrl.substr(ind, 11)
  if (ind == 0 || videoId.length != 11) {
    res.redirect("/"); return;
  }


  let text, response
  try {
   
    console.log("hello1")
    text = await GetText(videoId)
    console.log("hello2")
    response = await GetSummarizedText(text)
    console.log("hello3")
    fs.writeFileSync('output.txt', response)
    console.log('File saved successfully!');
    res.download(`${__dirname}/output.txt`);

  } catch (err) {
    console.log("Error Block")
    await errorHandler()
  }
  finally{
    console.log("finally")
    res.download(`${__dirname}/output.txt`);
  }
  

})

app.listen(process.env.PORT || port, () => { console.log("server listening") })
