//―――――――――――――――――――――――――――――――――――――――――― ┏  Modules ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

require('../settings')
const express = require('express')
const translate = require('translate-google')
const alip = require("../lib/listdl")
const textto = require('soundoftext-js')
const googleIt = require('google-it')
const { shortText } = require("limit-text-js")
const Canvas = require('canvas')
const TinyURL = require('tinyurl');
const emoji = require("emoji-api");
const isUrl = require("is-url")
const { ytMp4, ytMp3 } = require('../lib/y2mate')
const BitlyClient = require('bitly').BitlyClient
const canvasGif = require('canvas-gif')
const { convertStringToNumber } = require('convert-string-to-number'); 
const isImageURL = require('image-url-validator').default
const {fetchJson, getBuffer} = require('../lib/myfunc')
const Canvacord = require("canvacord");
const isNumber = require('is-number');
const User = require('../model/user');
const dataweb = require('../model/DataWeb');
const router = express.Router()


//―――――――――――――――――――――――――――――――――――――――――― ┏  Function ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

async function cekKey(req, res, next) {
	var apikey = req.query.apikey
	if (!apikey ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert apikey parameter"})  

    let db = await User.findOne({apikey: apikey});
    if(db === null) {
		return res.json({ status : false, creator : `${creator}`, message : "[!] Apikey not found"})  
		} else if(!db.isVerified) {
				return res.json({ status : false, creator : `${creator}`, message : "[!] Please verify your email before"})  
			} else if(db.limitApikey === 0) {
				return res.json({ status : false, creator : `${creator}`, message : "[!] Apikey reach limit"})  
			}else{
        return next();
    }
}

async function limitapikey(apikey) {
       await dataweb.updateOne({}, {$inc: {  RequestToday: 1 }})
       await User.findOneAndUpdate({apikey: apikey},{$inc: { limitApikey: -1}},{upsert: true,new: true})
}



//―――――――――――――――――――――――――――――――――――――――――― ┏  Dowloader  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\


router.get('/api/dowloader/fbdown', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})  
alip.fbdown(url).then(data => {
	if (!data.Normal_video ) return res.json(loghandler.noturl)
	limitapikey(req.query.apikey)
	res.json({
	status: true,
	creator: `${creator}`,
	result:	data
	})
	})
	 .catch(e => {
		res.json(loghandler.error)
})
})

router.get('/api/dowloader/twitter', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})   
	
alip.twitter(url).then(data => {
if (!data.video ) return res.json(loghandler.noturl)
limitapikey(req.query.apikey)
res.json({
status: true,
creator: `${creator}`,
result: data
})
})
.catch(e => {
res.json(loghandler.error)
})
})

router.get('/api/dowloader/tikok', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})  

alip.musically(url).then(data => {
    if (!data) return res.json(loghandler.noturl)
	limitapikey(req.query.apikey)
	res.json({
	    status: true,
	    creator: `${creator}`,
	    result: data
	})
}).catch(e => {
	res.json(loghandler.noturl)
})
})


router.get('/api/dowloader/igstorydowloader', cekKey, async (req, res, next) => {
	var username = req.query.username
	if (!username ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert username parameter"})   

	alip.igstory(username).then(async (data) => {
		if (!data) return res.json(loghandler.instgram) 
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
	    })
	})
})


router.get('/api/dowloader/igdowloader', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})   
	if (!/^((https|http)?:\/\/(?:www\.)?instagram\.com\/(p|tv|reel|stories)\/([^/?#&]+)).*/i.test(url)) return res.json(loghandler.noturl)

	alip.igdl(url).then(async (data) => {
		if (!data ) return res.json(loghandler.instgram) 
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
	    })
	}).catch(e => {
		res.json(loghandler.noturl)
    })
})

router.get('/api/dowloader/ytmp3', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"}) 

	var mp3 = await ytMp3(url)
	var mp4 = await ytMp4(url)
	if (!mp4 || !mp3) return res.json(loghandler.noturl)
	limitapikey(req.query.apikey)
		res.json({
			status: true,
			creator: `${creator}`,
			result:{ 
			link: mp3.result,
			size: mp3.size,
			title: mp4.title,
			desc: mp4.desc,
			thum: mp4.thumb,
			view: mp4.views,
			channel: mp4.channel,
			uploadDate: mp4.uploadDate
		 }
	   })
})

router.get('/api/dowloader/ytmp4', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"}) 

	var mp3 = await ytMp3(url)
	var mp4 = await ytMp4(url)
	if (!mp4 || !mp3) return res.json(loghandler.noturl)
	limitapikey(req.query.apikey)
		res.json({
			status: true,
			creator: `${creator}`,
			result:{ 
			link: mp4.result,
			size: mp4.size,
			quality: mp4.quality,
			title: mp4.title,
			desc: mp4.desc,
			thum: mp4.thumb,
			view: mp4.views,
			channel: mp4.channel,
			uploadDate: mp4.uploadDate
		 }
	   })
})

router.get('/api/dowloader/soundcloud', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})   
	
	alip.soundcloud(url).then(data => {
		if (!data.download ) return res.json(loghandler.noturl)
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
		})
	}).catch(e => {
			 res.json(loghandler.error)
    })
})

router.get('/api/dowloader/mediafire', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})   

	alip.mediafiredl(url).then(async (data) => {
		if (!data ) return res.json(loghandler.noturl)
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
	    })
	}).catch(e => {
		res.json(loghandler.noturl)
    })
})

router.get('/api/dowloader/sfilemobi', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})   

	alip.sfilemobi(url).then(async (data) => {
		if (!data ) return res.json(loghandler.noturl)
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
	    })
	}).catch(e => {
		res.json(loghandler.noturl)
    })
})


router.get('/api/dowloader/telesticker', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})   
	if (!url.match(/(https:\/\/t.me\/addstickers\/)/gi)) return res.json(loghandler.noturl)
	
	alip.telesticker(url).then(data => {
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
		})
		})
         .catch(e => {
	 res.json(loghandler.error)
})
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Text Pro  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

router.get('/api/textpro/pencil', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/create-a-sketch-text-effect-online-1044.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/glitch', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/create-impressive-glitch-text-effects-online-1027.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/blackpink', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/create-blackpink-logo-style-online-1001.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/berry', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/create-berry-text-effect-online-free-1033.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/neon', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/neon-light-text-effect-online-882.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})



router.get('/api/textpro/logobear', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/online-black-and-white-bear-mascot-logo-creation-1012.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/3dchristmas', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/3d-christmas-text-effect-by-name-1055.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/thunder', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/online-thunder-text-effect-generator-1031.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/3dboxtext', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/3d-box-text-effect-online-880.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/glitch2', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	var text2 = req.query.text2
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	if (!text2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter2"}) 
	alip.textpro("https://textpro.me/create-a-glitch-text-effect-online-free-1026.html", [text1,text2])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/glitchtiktok', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	var text2 = req.query.text2
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	if (!text2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter2"}) 
	alip.textpro("https://textpro.me/create-glitch-text-effect-style-tik-tok-983.html", [text1,text2])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/video-game-classic', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	var text2 = req.query.text2
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	if (!text2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter2"}) 
	alip.textpro("https://textpro.me/video-game-classic-8-bit-text-effect-1037.html", [text1,text2])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/marvel-studios', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	var text2 = req.query.text2
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	if (!text2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter2"}) 
	alip.textpro("https://textpro.me/create-logo-style-marvel-studios-online-971.html", [text1,text2])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/ninja-logo', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	var text2 = req.query.text2
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	if (!text2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter2"}) 
	alip.textpro("https://textpro.me/create-ninja-logo-online-935.html", [text1,text2])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/green-horror', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/create-green-horror-style-text-effect-online-1036.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/magma', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/create-a-magma-hot-text-effect-online-1030.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/3d-neon-light', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/create-3d-neon-light-text-effect-online-1028.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/3d-orange-juice', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/create-a-3d-orange-juice-text-effect-online-1084.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/chocolate-cake', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/chocolate-cake-text-effect-890.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/strawberry', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.textpro("https://textpro.me/strawberry-text-effect-online-889.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Phootoxy  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\


router.get('/api/photooxy/flaming', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/realistic-flaming-text-effect-online-197.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/photooxy/shadow-sky', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/shadow-text-effect-in-the-sky-394.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/photooxy/metallic', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/other-design/create-metallic-text-glow-online-188.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/photooxy/naruto', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/manga-and-anime/make-naruto-banner-online-free-378.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/photooxy/pubg', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	var text2 = req.query.text2
	if (!text2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter2"})  
	alip.photooxy("https://photooxy.com/battlegrounds/make-wallpaper-battlegrounds-logo-text-146.html", [text1,text2])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/under-grass', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/make-quotes-under-grass-376.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/harry-potter', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/create-harry-potter-text-on-horror-background-178.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/flower-typography', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/art-effects/flower-typography-text-effect-164.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/picture-of-love', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/create-a-picture-of-love-message-377.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/coffee-cup', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/put-any-text-in-to-coffee-cup-371.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/butterfly', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/butterfly-text-with-reflection-effect-183.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/night-sky', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/write-stars-text-on-the-night-sky-200.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/photooxy/carved-wood', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/carved-wood-effect-online-171.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/photooxy/illuminated-metallic', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/illuminated-metallic-effect-177.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/sweet-candy', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/sweet-andy-text-online-168.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Sound Of Text  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\



router.get('/api/soundoftext', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	var lan = req.query.lang
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	if (!lan ) return res.json({ status : false, creator : `${creator}`, message : "[!] please put the lang format correctly check the website https://soundoftext.com/docs to see the lang code"})   

textto.sounds.create({ text: text1, voice: lan })
.then(soundUrl => {
	limitapikey(req.query.apikey)
	res.json({
		status: true,
		creator: `${creator}`,
		result: soundUrl
	})
}).catch(e => {
	res.json(loghandler.error)
})
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Search  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\



router.get('/api/search/linkgroupwa', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
alip.linkwa(text1).then((data) =>{ 
	if (!data[0] ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
    res.json({
	status: true,
	creator: `${creator}`,
	result: data
    })
}).catch((err) =>{
       res.json(loghandler.notfound)
    })
})

router.get('/api/search/pinterest', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
alip.pinterest(text1).then((data) =>{ 
	if (!data[0] ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
    res.json({
	status: true,
	creator: `${creator}`,
	result: data
    })
    }).catch((err) =>{
        res.json(loghandler.notfound)
     })
})


router.get('/api/search/ringtone', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.ringtone(text1).then((data) =>{ 
	if (!data ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
    res.json({
	status: true,
	creator: `${creator}`,
	result: data
     })
    }).catch((err) =>{
     res.json(loghandler.notfound)
   })
})


router.get('/api/search/wikimedia', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
alip.wikimedia(text1).then((data) =>{ 
	if (!data[0] ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
    res.json({
	status: true,
	creator: `${creator}`,
	result: data
    })
     }).catch((err) =>{
       res.json(loghandler.notfound)
     })
})


router.get('/api/search/wallpaper', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.wallpaper(text1).then((data) =>{ 
	if (!data[0] ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
   res.json({
	status: true,
	creator: `${creator}`,
	result: data
   })
   }).catch((err) =>{
     res.json(loghandler.notfound)
   })
})

router.get('/api/search/google', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   

	googleIt({'query': text1}).then(results => {
		if (!results[0] ) return res.json(loghandler.notfound)
		limitapikey(req.query.apikey)
			res.json({
				status: true,
				creator: `${creator}`,
				result: results
			})
	}).catch(e => {	
		res.json(loghandler.notfound)
	})
})

router.get('/api/search/googleimage', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   

	var gis = require('g-i-s')
gis(text1, logResults)

function logResults(error, results) {
  if (error) {
	res.json(loghandler.notfound)
  }
  else {
	if (!results[0] ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
	res.json({
		status: true,
		creator: `${creator}`,
		result:  results
	})
  }
}
})


router.get('/api/search/ytplay', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"}) 

let yts = require("yt-search")
let search = await yts(text1)
let url = search.all[Math.floor(Math.random() * search.all.length)]
var mp3 = await ytMp3(url.url)
var mp4 = await ytMp4(url.url)
if (!mp4 || !mp3) return res.json(loghandler.noturl)
limitapikey(req.query.apikey)
	res.json({
		status: true,
		creator: `${creator}`,
		result:{ 
		title: mp4.title,
		desc: mp4.desc,
		thum: mp4.thumb,
		view: mp4.views,
		channel: mp4.channel,
		ago: url.ago,
		timestamp: url.timestamp,
		uploadDate: mp4.uploadDate,
		author: url.author,
		mp4:{
			result: mp4.result,
			size: mp4.size,
			quality: mp4.quality
		},
		mp3:{
			result: mp3.result,
			size: mp3.size
		}
	}
	 })

})

router.get('/api/search/sticker', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.stickersearch(text1).then(data => {
		if (!data ) return res.json(loghandler.notfound)
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
		})
		}).catch(e => {
	 res.json(loghandler.error)
})
})

router.get('/api/search/sfilemobi', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})   
	alip.sfilemobiSearch(text1).then(data => {
		if (!data ) return res.json(loghandler.notfound)
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
		})
		}).catch(e => {
	 res.json(loghandler.error)
})
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Random Gambar ┓ ―――――――――――――――――――――――――――――――――――――――――― \\


router.get('/api/randomgambar/couplepp', cekKey, async (req, res, next) => {
	let resultt = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/kopel.json')
	let random = resultt[Math.floor(Math.random() * resultt.length)]
	limitapikey(req.query.apikey)
	res.json({
	status: true,
	creator: `${creator}`,
		result: {
			male: random.male,
			female: random.female
		}
	})

})


router.get('/api/randomgambar/dadu', cekKey, async (req, res, next) => {

	let dadu = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/dadu.json')
	let random = dadu[Math.floor(Math.random() * dadu.length)]
	var result = await getBuffer(random.result)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/webp'})
	res.send(result)
})


router.get('/api/randomgambar/coffee', cekKey, async (req, res, next) => {
	var result = await getBuffer('https://coffee.alexflipnote.dev/random')
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(result)
})

// Game

router.get('/api/game/tembakgambar', cekKey, async (req, res, next) => {
 alip.tebakgambar().then((data) =>{ 
	limitapikey(req.query.apikey)	  
  res.json({
	status: true,
	creator: `${creator}`,
	result: data
   })
   }).catch((err) =>{
    res.json(loghandler.error)
  })
})

router.get('/api/game/susunkata', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/susunkata.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
})

})

router.get('/api/game/tembakbendera', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/tebakbendera.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
})

})


router.get('/api/game/tembakgame', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/tebakgame.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
})
})

router.get('/api/game/tembakkata', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/tebakkata.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
   })
})

router.get('/api/game/tembaklirik', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/tebaklirik.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
   })
})

router.get('/api/game/tembaklagu', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/tebaklagu.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
  })
})
router.get('/api/game/tembakkimia', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/tebakkimia.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
  })
})

//―――――――――――――――――――――――――――――――――――――――――― ┏ Maker ┓ ―――――――――――――――――――――――――――――――――――――――――― \\


router.get('/api/maker/circle', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back"}) 
	const hasil =  await Canvacord.Canvas.circle(text);
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})


router.get('/api/maker/beautiful', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back"}) 
	const hasil =  await Canvacord.Canvas.beautiful(text);
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
})


router.get('/api/maker/blur', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back"}) 
	const hasil =  await Canvacord.Canvas.blur(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})


router.get('/api/maker/darkness', cekKey, async (req, res) => {
	var text = req.query.url
	var no = req.query.no
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})
	if (!no ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert number parameter"})

	var img = await isImageURL(text)
	var n = isNumber(no)
	if ( !img ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back"}) 
	if ( !n ) return res.json({ status : false, creator : 'Ryzen', message : "[!] number parameter only"}) 

	const hasil =  await Canvacord.Canvas.darkness(text,shortText(no, 3))
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
})

router.get('/api/maker/facepalm', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back"}) 

	const hasil =  await Canvacord.Canvas.facepalm(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})

router.get('/api/maker/invert', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back"}) 

	const hasil =  await Canvacord.Canvas.invert(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})

router.get('/api/maker/pixelate', cekKey, async (req, res) => {
	var text = req.query.url
	var no = req.query.no
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})
	if (!no ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert number parameter"})

	var img = await isImageURL(text)
	var n = isNumber(no)
	if ( !img ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back"}) 
	if ( !n ) return res.json({ status : false, creator : 'Ryzen', message : "[!] number parameter only"}) 

	const hasil =  await Canvacord.Canvas.pixelate(text,convertStringToNumber(no))
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})


router.get('/api/maker/rainbow', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back"}) 

	const hasil =  await Canvacord.Canvas.rainbow(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})

router.get('/api/maker/resize', cekKey, async (req, res) => {
	var text = req.query.url
	var width = req.query.width
	var height = req.query.height

	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})
	if (!width ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter width"})
	if (!height ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter height"})

	let w = width
	let h = height
	if (w>1000){ w = "1000"}
	if (h>1000){ h = "1000"}

	var img = await isImageURL(text)
	var wid = isNumber(width)
	var hei = isNumber(height)
	if ( !img ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back"}) 
	if ( !wid ) return res.json({ status : false, creator : 'Ryzen', message : "[!] parameter width number only"}) 
	if ( !hei ) return res.json({ status : false, creator : 'Ryzen', message : "[!] parameter height number only"}) 

	const hasil =  await Canvacord.Canvas.resize(text, convertStringToNumber(w),  convertStringToNumber(h))
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})

router.get('/api/maker/trigger', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back"}) 

	const hasil =  await Canvacord.Canvas.trigger(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'gif'})
	res.send(hasil)
  
})

router.get('/api/maker/wanted', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back"}) 

	const hasil =  await Canvacord.Canvas.wanted(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})

router.get('/api/maker/wasted', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back"}) 

	const hasil =  await Canvacord.Canvas.wasted(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})

router.get('/api/maker/attp', cekKey, async (req, res) => {
	var text = req.query.text
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})

const file = "./asset/image/attp.gif"

let length = text.length

var font =90

if (length>12){ font = 68}
if (length>15){ font = 58}
if (length>18){ font = 55}
if (length>19){ font = 50}
if (length>22){ font = 48}
if (length>24){ font = 38}
if (length>27){ font = 35}
if (length>30){ font = 30}
if (length>35){ font = 26}
if (length>39){ font = 25}
if (length>40){ font = 20}
if (length>49){ font = 10}
Canvas.registerFont('./asset/font/SF-Pro.ttf', { family: 'SF-Pro' })
await canvasGif(
	file,(ctx) => {
var couler = ["#ff0000","#ffe100","#33ff00","#00ffcc","#0033ff","#9500ff","#ff00ff"]
let jadi = couler[Math.floor(Math.random() * couler.length)]

		function drawStroked(text, x, y) {
			ctx.lineWidth = 5
			ctx.font = `${font}px SF-Pro`
			ctx.fillStyle = jadi
			ctx.strokeStyle = 'black'
			ctx.textAlign = 'center'
			ctx.strokeText(text, x, y)
			ctx.fillText(text, x, y)
		}
		
		drawStroked(text,290,300)

	},
	{
		coalesce: false, // whether the gif should be coalesced first (requires graphicsmagick), default: false
		delay: 0, // the delay between each frame in ms, default: 0
		repeat: 0, // how many times the GIF should repeat, default: 0 (runs forever)
		algorithm: 'octree', // the algorithm the encoder should use, default: 'neuquant',
		optimiser: false, // whether the encoder should use the in-built optimiser, default: false,
		fps: 7, // the amount of frames to render per second, default: 60
		quality: 100, // the quality of the gif, a value between 1 and 100, default: 100
	}
).then((buffer) =>{
limitapikey(req.query.apikey)
res.set({'Content-Type': 'gif'})
res.send(buffer)

})
  

router.get('/api/maker/ttp', cekKey, async (req, res) => {
	var text = req.query.text
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})

	Canvas.registerFont('./asset/font/SF-Pro.ttf', { family: 'SF-Pro' })
	let length = text.length
		
	var font = 90
	if (length>12){ font = 68}
	if (length>15){ font = 58}
	if (length>18){ font = 55}
	if (length>19){ font = 50}
	if (length>22){ font = 48}
	if (length>24){ font = 38}
	if (length>27){ font = 35}
	if (length>30){ font = 30}
	if (length>35){ font = 26}
	if (length>39){ font = 25}
	if (length>40){ font = 20}
	if (length>49){ font = 10}

	var ttp = {}
	ttp.create = Canvas.createCanvas(576, 576)
	ttp.context = ttp.create.getContext('2d')
	ttp.context.font =`${font}px SF-Pro`
	ttp.context.strokeStyle = 'black'
	ttp.context.lineWidth = 3
	ttp.context.textAlign = 'center'
	ttp.context.strokeText(text, 290,300)
	ttp.context.fillStyle = 'white'
	ttp.context.fillText(text, 290,300)
	limitapikey(req.query.apikey)
		res.set({'Content-Type': 'image/png'})
		res.send(ttp.create.toBuffer())
  
})
})

router.get('/api/maker/emojimix', cekKey, async (req, res, next) => {
	var emoji1 = req.query.emoji1
	var emoji2 = req.query.emoji2
	if (!emoji1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert emoji1 parameter"})
	if (!emoji2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert emoji2 parameter"})  
	
	let data = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`)
	let jadi = data.results[Math.floor(Math.random() * data.results.length)]
	if (!jadi ) return res.json(loghandler.notfound)
	for (let ress of data.results) {
	resul = await getBuffer(ress.url)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(resul)
}
})

router.get('/api/maker/welcome1', cekKey, async (req, res, next) => {
	var name = req.query.name
    var grup = req.query.gpname
    var member = req.query.member
	var pp = req.query.pp
    var bg = req.query.bg
	
	var imgpp = await isImageURL(pp)
	var bgimg = await isImageURL(bg)

    if (!name ) return res.json({ status : false, creator : 'Ryzen', message : "[!] insert name parameter"})  
	if (!grup ) return res.json({ status : false, creator : 'Ryzen', message : "[!] insert gpname parameter"})  
    if (!member ) return res.json({ status : false, creator : 'Ryzen', message : "[!] insert member parameter"})  
	if (!pp ) return res.json({ status : false, creator : 'Ryzen', message : "[!] insert pp parameter"})  
    if (!bg ) return res.json({ status : false, creator : 'Ryzen', message : "[!] insert bg parameter"})  

	if ( !imgpp ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back pp"}) 
	if ( !bgimg ) return res.json({ status : false, creator : 'Ryzen', message : "[!] check image url back bg"}) 
   
    Canvas.registerFont('./asset/font/Creme.ttf', { family: 'creme' })

var welcomeCanvas = {}
welcomeCanvas.create = Canvas.createCanvas(1024, 500)
welcomeCanvas.context = welcomeCanvas.create.getContext('2d')
welcomeCanvas.context.font = '72px creme'
welcomeCanvas.context.fillStyle = '#ffffff'

await Canvas.loadImage("./asset/image/wbg1.jpg").then(async (img) => {
    welcomeCanvas.context.drawImage(img, 0, 0, 1024, 500)

})

let can = welcomeCanvas

await Canvas.loadImage(bg)
.then(bg => {
can.context.drawImage(bg, 320, 0, 709, 360)
})

    let canvas = welcomeCanvas
    canvas.context.beginPath()
    canvas.context.arc(174, 279, 115, 0, Math.PI * 2, true)
    canvas.context.stroke()
    canvas.context.fill()
    canvas.context.font = '100px creme',
    canvas.context.textAlign = 'center'
    canvas.context.fillText("Welcome", 670, 140)
    canvas.context.font = '100px Helvetica'
    canvas.context.fillText("____   ____", 670, 160)
    canvas.context.fillText("✩", 670, 215)
    canvas.context.font = '100px creme'
    canvas.context.fillText(shortText(grup, 17), 670, 300)
    canvas.context.font = '40px creme'
    canvas.context.textAlign = 'start'
    canvas.context.fillText(shortText(name, 40), 420, 420)
    canvas.context.font = '35px creme'
    canvas.context.fillText(`${shortText(member, 10)} th member`, 430, 490)
    canvas.context.beginPath()
    canvas.context.arc(174, 279, 110, 0, Math.PI * 2, true)
    canvas.context.closePath()
    canvas.context.clip()
    await Canvas.loadImage(pp)
    .then(pp => {
        canvas.context.drawImage(pp, 1, 150, 300, 300)
    })
    
	limitapikey(req.query.apikey)
    res.set({'Content-Type': 'image/png'})
    res.send(canvas.create.toBuffer())
})


router.get('/api/maker/goodbye1', cekKey, async (req, res, next) => {
	var name = req.query.name
    var grup = req.query.gpname
	var pp = req.query.pp
    var member = req.query.member
    var bg = req.query.bg

	var imgpp = await isImageURL(pp)
	var bgimg = await isImageURL(bg)

    if (!name ) return res.json({ status : false, creator : 'Ryzen', message : "[!] insert name parameter"})  
	if (!grup ) return res.json({ status : false, creator : 'Ryzen', message : "[!] insert gpname parameter"})  
    if (!member ) return res.json({ status : false, creator : 'Ryzen', message : "[!] insert member parameter"})  
    if (!bg ) return res.json({ status : false, creator : 'Ryzen', message : "[!] insert bg parameter"})  
	if (!pp) return res.json({ status : false, creator : 'Ryzen', message : "[!] insert pp parameter"}) 
   
	if ( !imgpp ) return res.json({ status : false, creator : 'Ryzen', message : "[!] insert pp link parameter"}) 
	if ( !bgimg ) return res.json({ status : false, creator : 'Ryzen', message : "[!] insert bg link parameter"}) 

    Canvas.registerFont('./asset/font/Creme.ttf', { family: 'creme' })

var goobyeCanvas = {}
goobyeCanvas.create = Canvas.createCanvas(1024, 500)
goobyeCanvas.context =  goobyeCanvas.create.getContext('2d')
goobyeCanvas.context.font = '72px creme'
goobyeCanvas.context.fillStyle = '#ffffff'

await Canvas.loadImage("./asset/image/wbg1.jpg").then(async (img) => {
	goobyeCanvas.context.drawImage(img, 0, 0, 1024, 500)

})

let can =  goobyeCanvas

await Canvas.loadImage(bg)
.then(bg => {
can.context.drawImage(bg, 320, 0, 709, 360)
})

    let canvas = goobyeCanvas
    canvas.context.beginPath()
    canvas.context.arc(174, 279, 115, 0, Math.PI * 2, true)
    canvas.context.stroke()
    canvas.context.fill()
    canvas.context.font = '100px creme',
    canvas.context.textAlign = 'center'
    canvas.context.fillText("GoodBye", 670, 140)
    canvas.context.font = '100px Helvetica'
    canvas.context.fillText("____   ____", 670, 160)
    canvas.context.fillText("✩", 670, 215)
    canvas.context.font = '100px creme'
    canvas.context.fillText(shortText(grup, 17), 670, 300)
    canvas.context.font = '40px creme'
    canvas.context.textAlign = 'start'
    canvas.context.fillText(shortText(name, 40), 420, 420)
    canvas.context.font = '35px creme'
    canvas.context.fillText(`${shortText(member, 10)} th member`, 430, 490)
    canvas.context.beginPath()
    canvas.context.arc(174, 279, 110, 0, Math.PI * 2, true)
    canvas.context.closePath()
    canvas.context.clip()
    await Canvas.loadImage(pp)
    .then(pp => {
        canvas.context.drawImage(pp, 1, 150, 300, 300)
    })
    
	limitapikey(req.query.apikey)
    res.set({'Content-Type': 'image/png'})
    res.send(canvas.create.toBuffer())
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Link Short  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

router.get('/api/linkshort/tinyurl', cekKey, async (req, res, next) => {
	var link = req.query.link
	if (!link ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert link parameter"})  

    var islink = isUrl(link)
	if (!islink ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter only"})  


TinyURL.shorten(link, function(link, err) {
  if (err) return res.json(loghandler.error)
  	limitapikey(req.query.apikey)
	res.json({
		status: true,
		creator: `${creator}`,
		result: link
		})
});
	
})

router.get('/api/linkshort/tinyurlwithalias', cekKey, async (req, res, next) => {
	var link = req.query.link
	var alias = req.query.alias
	if (!link ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert link parameter"})  
	if (!alias ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert alias parameter"})  

    var islink = isUrl(link)
	if (!islink ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter only"})  

	const data = { 'url': link, 'alias': shortText(alias, 30) }

	TinyURL.shortenWithAlias(data).then(function(link)  {	
		if (link == "Error") return res.json(loghandler.redy)
		limitapikey(req.query.apikey)
	res.json({
		status: true,
		creator: `${creator}`,
		result: link
		})
})
})
	
router.get('/api/linkshort/cuttly', cekKey, async (req, res, next) => {
	var link = req.query.link
	if (!link ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert link parameter"})  
    var islink = isUrl(link)
	if (!islink ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter only"})  

	let randomapicuttly = apicuttly[Math.floor(Math.random() * apicuttly.length)]
	var hasil = await fetchJson(`https://cutt.ly/api/api.php?key=${randomapicuttly}&short=${link}`)
    if (!hasil.url ) return res.json(loghandler.noturl)
	limitapikey(req.query.apikey)
	res.json({
		status: true,
		creator: `${creator}`,
		result: hasil.url
		})
});


router.get('/api/linkshort/bitly', cekKey, async (req, res, next) => {
	var link = req.query.link
	if (!link ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert link parameter"})  

	var islink = isUrl(link)
	if (!islink ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter only"})  

	let randomapibitly = apibitly[Math.floor(Math.random() * apibitly.length)]
	const bitly = new BitlyClient(randomapibitly)
	bitly
	.shorten(link)
	.then(function(result) {
		limitapikey(req.query.apikey)
		res.json({
			status: true,
			creator: `${creator}`,
			result : result.link
			})
	 
	})
	.catch(function(error) {
	 res.json(loghandler.error)
	});
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Infomation  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\


router.get('/api/info/githubstalk', cekKey, async (req, res, next) => {
	var user = req.query.user
	if (!user ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert user parameter"})  
	let gitstalk = await fetchJson(`https://api.github.com/users/${user}`)
	if (!gitstalk.login ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)

	res.json({
	status: true,
	creator: `${creator}`,
	result: gitstalk
	})

})

router.get('/api/info/waktuksolatmy', cekKey, async (req, res, next) => {
	alip.watuksolatmy()
	.then(data => {
		if (!data.Tarikh ) return res.json(loghandler.error)
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
		})
		}).catch(e => {
			 res.json(loghandler.error)
})
})


router.get('/api/info/translate', cekKey, async (req, res, next) => {
	var text = req.query.text
    var lang = req.query.lang

	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})  
	if (!lang ) return res.json({ status : false, creator : `${creator}`, message : "[!] enter parameters. You can see the list of languages ​​at https://cloud.google.com/translate/docs/languages"})  

	translate(text, {to: lang}).then(data => {
		limitapikey(req.query.apikey)
		res.json({
			status: true,
			creator: `${creator}`,
			result: data
		})
	}).catch(err => {
		res.json({ status : false, creator : `${creator}`, message : "[!] enter the lang parameter Correctly. You can see the list of languages ​​at https://cloud.google.com/translate/docs/languages"})
	})
        
})

router.get('/api/info/emoji', cekKey, async (req, res, next) => {
	var emoji1 = req.query.emoji
	if (!emoji1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert emoji parameter"})
      var hasil = emoji.get(emoji1)
       if (hasil == null) return res.json({ status : false, creator : `${creator}`, message : "[!] insert only one emoji parameter"})
           limitapikey(req.query.apikey)
           res.json({
			status: true,
	        creator: `${creator}`,
			result: hasil
		})
})


//―――――――――――――――――――――――――――――――――――――――――― ┏  Tools ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

router.get('/api/tools/ebase64', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})  
	if (text1.length > 2048) return res.json({ status : false, creator : `${creator}`, message : "[!] Max 2.048 String!"})
	limitapikey(req.query.apikey)

		res.json({
			status: true,
			creator: `${creator}`,
			result: Buffer.from(text1).toString('base64')
		})

})

router.get('/api/tools/debase64', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})  
	if (text1.length > 2048) return res.json({ status : false, creator : `${creator}`, message : "[!] Max 2.048 String!"})
	limitapikey(req.query.apikey)

		res.json({
			status: true,
			creator: `${creator}`,
			result: Buffer.from(text1, 'base64').toString('ascii')
		})

})

router.get('/api/tools/ebinary', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})  
	if (text1.length > 2048) return res.json({ status : false, creator : `${creator}`, message : "[!] Max 2.048 String!"})

	function encodeBinary(char) {
		return char.split("").map(str => {
			 const converted = str.charCodeAt(0).toString(2);
			 return converted.padStart(8, "0");
		}).join(" ")
	 }
	 limitapikey(req.query.apikey)

		res.json({
			status: true,
			creator: `${creator}`,
			result: encodeBinary(text1)
		})
})

router.get('/api/tools/debinary', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})  
	if (text1.length > 2048) return res.json({ status : false, creator : `${creator}`, message : "[!] Max 2.048 String!"})

	function decodeBinary(char) {
		return char.split(" ").map(str => String.fromCharCode(Number.parseInt(str, 2))).join("");
	 }
	 limitapikey(req.query.apikey)

		res.json({
			status: true,
			creator: `${creator}`,
			result: decodeBinary(text1)
		})

})

router.get('/api/tools/ssweb', cekKey, async (req, res, next) => {
	var link = req.query.link
	if (!link ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert link parameter"})  

	var islink = isUrl(link)
	if (!islink ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert url parameter only"})  


	alip.ssweb(link).then((data) =>{ 
		limitapikey(req.query.apikey)
		if (!data ) return res.json(loghandler.notfound)
		res.set({'Content-Type': 'image/png'})
		res.send(data)
	}).catch((err) =>{
	 res.json(loghandler.notfound)
	
	})

})

router.get('/api/tools/styletext', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter "}) 
	var text = shortText(text1, 10000)  
	alip.styletext(text)
.then((data) =>{ 
	if (!data ) return res.json(loghandler.error)
	limitapikey(req.query.apikey)

  res.json({
	status: true,
	creator: `${creator}`,
	result: data
})
})
.catch((err) =>{
 res.json(loghandler.error)

})
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Islamic  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\


router.get('/api/islamic/surah', cekKey, async (req, res, next) => {
	var text1 = req.query.no
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert number parameter"})  
	alip.surah(text1).then((data) =>{ 
	if (!data ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
		res.json({
			status: true,
			creator: `${creator}`,
			result: data
		})
}).catch((err) =>{
 res.json(loghandler.error)

})
})


router.get('/api/islamic/tafsirsurah', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] insert text parameter"})  
	alip.tafsirsurah(text1).then((data) =>{ 
	if (!data[0] ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
		res.json({
			status: true,
			creator: `${creator}`,
			result: data
		})
}).catch((err) =>{
 res.json(loghandler.error)

})
})

module.exports = router