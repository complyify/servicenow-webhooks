import request from 'request'

const _username = new WeakMap()
const _password = new WeakMap()

export class ServiceNow {
  constructor (domain, username, password) {
    this._domain = domain

    _username.set(this, username)
    _password.set(this, password)
  }

  async findIncidents (qs = {}) {
    const endpoint = `https://${this._domain}/api/now/table/incident`

    const auth = { username: _username.get(this), password: _password.get(this) }
    const payload = { auth, qs }

    return new Promise((resolve, reject) => request.get(endpoint, payload, (err, res) => {
      if (err) return reject(new Error(err))
      if (res.statusCode === 200) return resolve(JSON.parse(res.body))

      return reject(new Error('ERROR'))
    }))
  }

  async createIncident (json = {}) {
    const endpoint = `https://${this._domain}/api/now/table/incident`

    const auth = { username: _username.get(this), password: _password.get(this) }
    const payload = { auth, json }

    return new Promise((resolve, reject) => request.post(endpoint, payload, (err, res) => {
      if (err) return reject(new Error(err))
      if (res.statusCode === 201) return resolve(res.body)

      return reject(new Error('ERROR'))
    }))
  }

  async updateIncident (sysId, json = {}) {
    const endpoint = `https://${this._domain}/api/now/table/incident/${sysId}`

    const auth = { username: _username.get(this), password: _password.get(this) }
    const payload = { auth, json }

    return new Promise((resolve, reject) => request.put(endpoint, payload, (err, res) => {
      if (err) return reject(new Error(err))
      if (res.statusCode === 200) return resolve(res.body)

      return reject(new Error('ERROR'))
    }))
  }
}
