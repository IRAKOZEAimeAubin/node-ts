import express from 'express'
import {createUser, getUserByEmail} from '../db/users'
import {authentication, random} from '../helpers'

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const {email, password, username} = req.body

    if (!email || !password || !username) {
      return res.sendStatus(400).json({
        status: 400,
        message: 'Fill in all details to continue.',
      })
    }

    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return res.sendStatus(400).json({
        status: 400,
        message: 'Email in use. Try logging in?',
      })
    }

    const salt = random()
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    })

    return res
      .status(200)
      .json({
        status: 200,
        message: 'User created successfully.',
        user: {
          username: user.username,
        },
      })
      .end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const {email, password} = req.body

    if (!email || !password) {
      return res.sendStatus(400)
    }

    const user = await getUserByEmail(email).select(
      '+authentication.salt +authentication.password',
    )

    if (!user) {
      return res.sendStatus(400)
    }

    const expectedHash = authentication(user.authentication.salt, password)

    if (user.authentication.password !== expectedHash) {
      return res.sendStatus(403)
    }

    const salt = random()
    user.authentication.sessionToken = authentication(salt, user._id.toString())

    await user.save()

    res.cookie('TODO-AUTH', user.authentication.sessionToken, {
      domain: 'localhost',
    })

    return res.status(200).json({user}).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}
