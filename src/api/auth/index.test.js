import request from 'supertest'
import { User } from '../user'
import { verify } from '../../services/jwt'
import express from '../../services/express'
import routes from '.'

const app = () => express(routes)

let user

beforeEach(async () => {
  user = await User.create({email: 'a@a.com', password: '123456', name: 'Tester'})
})

test('POST /auth 201', async () => {
  const { status, body } = await request(app())
    .post('/')
    .auth('a@a.com', '123456')
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(typeof body.token).toBe('string')
  expect(typeof body.user).toBe('object')
  expect(body.user.id).toBe(user.id)
  expect(await verify(body.token)).toBeTruthy()
})

test('POST /auth 400 - invalid email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .auth('invalid', '123456')
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('email')
})

test('POST /auth 400 - invalid password', async () => {
  const { status, body } = await request(app())
    .post('/')
    .auth('a@a.com', '123')
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

test('POST /auth 401 - user does not exist', async () => {
  const { status } = await request(app())
    .post('/')
    .auth('b@b.com', '123456')
  expect(status).toBe(401)
})

test('POST /auth 401 - wrong password', async () => {
  const { status } = await request(app())
    .post('/')
    .auth('a@a.com', '654321')
  expect(status).toBe(401)
})

test('POST /auth 401 (master) - missing auth', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})
