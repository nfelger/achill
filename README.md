# 📃⏳ Achill

Web app to help you fill out Troi. Uses the [Svelte](https://svelte.dev/) framework and the [Troi API](https://v2.troi.dev/).

#### 👉 Also check out our other in-house self-built Slack bot for Troi: [BleibTroy](https://github.com/digitalservice4germany/troi-slack-bot)

## Setup Troi

Two things need to happen in your Troi account (it might already be set up correctly):

- your account needs write-access to the Troi-API, Lisa S. can make that happen as a Troi admin (test: if you can log into this web app you're good)
- you need to mark your project(s) as favourite, only those will be accessible within Achill and BleibTroy:

![Troi desk screenshot](https://user-images.githubusercontent.com/5141792/167609943-a83b3018-3e06-4a7e-8584-003531e56cbc.png)

## Setup

Install dependencies.

```sh
npm install
```

## Run

```sh
npm run dev
```

## Docker

```sh
# build the container
docker build . --tag tyt
# run the container
docker run -p 3080:80 -it --rm tyt
# now it is accessible at http://localhost:3080
```
