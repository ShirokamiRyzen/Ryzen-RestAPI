require("./api.js")
__path = process.cwd()
const express = require('express')
const { performance } = require('perf_hooks')
const router = express.Router();

router.get('/', (req, res) => {
	res.sendFile(__path + '/view/home.html')
});
router.get('/docs', (req, res) => {
	res.sendFile(__path + '/view/docs.html')
});
module.exports = router
