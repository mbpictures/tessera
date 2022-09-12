
const plugins = Boolean(process.env.INSTRUMENT_CODE) === true ? ['istanbul'] : []

module.exports = {
    presets: ['next/babel'],
    plugins: plugins,
};
