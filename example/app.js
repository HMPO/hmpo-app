const { setup } = require('hmpo-app');
const express = require('express');

const { app, staticRouter, router } = setup({ config: { APP_ROOT: __dirname } });

// Override template file extension from .html to .njk
app.set('view engine', 'njk');

// Mock API to submit data to
staticRouter.use(express.json());
staticRouter.post('/api/submit', (req, res) => {
    console.log(`Mock submit API received data: ${JSON.stringify(req.body, null, 2)}`);
    setTimeout(() => {
        res.json({
            reference: Math.round(100000 + Math.random() * 100000)
        });
    }, 1000);
});

router.use('/eligibility', require('./routes/eligibility'));
router.use('/apply', require('./routes/apply'));
router.get('/', (req, res) => res.redirect('/eligibility'));
