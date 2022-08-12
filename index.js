const express = require('express')
const cors = require('cors')
const axios = require('axios')
const cheerio = require('cheerio')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')


const url = 'https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki'
const characterUrl = "https://kimetsu-no-yaiba.fandom.com/wiki/"
const app = express();

// setup 
app.use(bodyParser.json({ limit: "50mb" }))
app.use(cors())
dotenv.config()

app.use(
    bodyParser.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000,
    })
)

//rounter

//get all character
app.get("/v1", (req, resp) => {
    const thumnails = []
    const limit = Number(req.query.limit)
    try {
        axios(url).then((res) => {
            const html = res.data
            const $ = cheerio.load(html)

            $(".portal", html).each(function() {
                const name = $(this).find("a").attr("title")
                const url = $(this).find("a").attr("href")
                const image = $(this).find("a > img").attr("data-src")

                // wiki/Tanjiro_Kamado
                thumnails.push({
                    name: name,
                    url: "https://anime-api-hde7.onrender.com/v1" + url.split("/wiki")[1],
                    imgage: image
                })
            })
            if (limit && limit > 0) {
                resp.status(200).json(thumnails.slice(0, limit))
            } else {
                resp.status(200).json(thumnails);
            }
        })

    } catch (err) {
        resp.status(500).json(err)
    }
})
// get a character
app.get("/v1/:character", (req, resp) => {
    let url = characterUrl + req.params.character
    const titles = []
    const details = []
    const galleries = []
    const characters = []
    const characterObj = {}
    try {
        axios(url).then((res) => {
            const html = res.data
            const $ = cheerio.load(html)

            //Get gallery
            $(".wikia-gallery-item", html).each(function() {
                const gallery = $(this).find("a > img").attr("data-src")
                galleries.push(gallery)
            })

            $("aside", html).each(function() {
                // get banner image
                const image = $(this).find("img").attr("src")


                // get the title of character title
                $(this).find("section > div > h3")
                .each(function() {
                    titles.push($(this).text())
                })

                // get character details
                $(this).find("section > div > div").each(function() {
                    details.push($(this).text())
                })

                if (image != undefined) {
                    console.log(galleries)
                    // creat object with title as key and details as value
                    for (let i = 0; i < titles.length; i++) {
                        characterObj[titles[i].toLowerCase()] = details[i]
                    }
                    characters.push({
                        name: req.params.character.replace("/", " "),
                        gallery: galleries,
                        image: image,
                        ...characterObj
                    })
                }
            })

            resp.status(200).json(characters)
        })
    } catch (err) {
        resp.status(500).json(err)
    }
})
//run port

app.listen(process.env.PORT || 8000, () => {
    console.log("server is running on port 8080")
})