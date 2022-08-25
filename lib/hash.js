const crypto = require('crypto')

const digest = (value, algorithm = 'md5') => {
  const hash = crypto.createHash(algorithm)
  return hash.update(value).digest('hex')
}

module.exports = {
  digest,
}
