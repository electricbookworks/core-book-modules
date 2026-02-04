function ebSlugify (string) {
  const from = 'ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç\'{}´-+¿?.,;:[]*¨¡!=()&%$#/"_'
  const to = ' '
  const mapping = {}
  for (let i = 0, j = from.length; i < j; i++) {
    mapping[from.charAt(i)] = to
  }
  const ret = []
  for (let i = 0, j = string.length; i < j; i++) {
    const c = string.charAt(i)
    if (Object.prototype.hasOwnProperty.call(mapping, string.charAt(i))) {
      ret.push(mapping[c])
    } else {
      ret.push(c)
    }
  }

  // Allowed word character ranges - add more as needed
  // E.g. const KOREAN_CHARS = '\\u1100-\\u11FF\\u3130-\\u318F\\uA960-\\uA97F\\uAC00-\\uD7AF\\uD7B0-\\uD7FF'
  const LATIN_CHARS = '-A-Za-z0-9'
  const allowedChars = `[^${LATIN_CHARS}]+`

  return ret.join('').trim().replace(new RegExp(allowedChars, 'g'), '-').toLowerCase()
}

module.exports = ebSlugify
