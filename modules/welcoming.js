const rp = require("request-promise");
const config = require('config');
const { sentences } = require('../data/welcoming_sentences.json');

const { deeplKey } = config.bot;
const { channels } = config;

let supportedLanguages = [];

module.exports = class WelcomingModule {

    static FetchAvailableLanguages(){
        const requestOptions = {
            method: "GET",
            uri: 'https://api-free.deepl.com/v2/glossary-language-pairs',
            headers: {
                "Authorization": "DeepL-Auth-Key " + deeplKey,
                "Content-Type": "application/json",
            },
            json: true,
        };
        
        rp(requestOptions).then((response) => {
            response.supported_languages.forEach((elem) => {
                if (!supportedLanguages.includes(elem.target_lang)){
                    supportedLanguages.push(elem.target_lang)
                }
            })
        }).catch(err => {
            console.log(err)
        });
    }

    static MemberWelcoming(member) {
        const channel = member.guild.channels.cache.find(channel => channel.id === channels.general); // Get desired channel with an id specified in config
        const rdmNumber = parseInt(Math.floor(Math.random() * sentences.length));
        const rdmLang = parseInt(Math.floor(Math.random() * supportedLanguages.length));
        const sentence = sentences[rdmNumber];
        const lang = supportedLanguages[rdmLang];
    
        const requestOptions = {
            method: "GET",
            uri: 'https://api-free.deepl.com/v2/translate',
            qs: {
                text: sentence,
                auth_key: deeplKey,
                target_lang: lang.toString().toUpperCase(),
            },
            headers: {
                "Content-Type": "application/json",
            },
            json: true,
        };
    
        rp(requestOptions).then(response => {
            const { text } = response.translations[0] // The translated text from Deepl
            const replacedText = text.replace('%%%%s', member.user.toString())

            channel.send(replacedText); 
        }).catch(err => {
            console.log(err)
        });
    }

    /**
     * Request a translation to Deepl a random sentences with a random language
     * @returns Promise
     */
    async getWelcomeSentence(){
        
    }
  
    /**
     * Get all available languages on deepl API
     * @returns Promise 
     */
    static getDeeplSupportedLanguages(){
        
    }
};
