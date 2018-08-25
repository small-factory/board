const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Bare Realtor'))

app.listen(process.env.PORT || 3000, () => console.log('running...'))